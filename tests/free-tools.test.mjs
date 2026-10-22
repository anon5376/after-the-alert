import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync,
  rmSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const phpScript = fileURLToPath(new URL('../site/downloads/check-php-version.mjs', import.meta.url));
const metadataScript = fileURLToPath(new URL('../site/downloads/inspect-litellm-metadata.sh', import.meta.url));

function php(...args) {
  return spawnSync(process.execPath, [phpScript, ...args], { encoding: 'utf8' });
}

function inspect(args, options = {}) {
  return spawnSync('/bin/bash', [metadataScript, ...args], { encoding: 'utf8', ...options });
}

function fixture(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'free-tools-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

test('PHP classifies both sides of each published fixed-version boundary', () => {
  const cases = [
    ['8.2.34', 'MATCHES_PUBLISHED_AFFECTED_RANGE'],
    ['8.2.35', 'MEETS_PUBLISHED_VERSION_FLOOR'],
    ['8.2.36', 'MEETS_PUBLISHED_VERSION_FLOOR'],
    ['8.3.35', 'MATCHES_PUBLISHED_AFFECTED_RANGE'],
    ['8.3.36', 'MEETS_PUBLISHED_VERSION_FLOOR'],
    ['8.3.37', 'MEETS_PUBLISHED_VERSION_FLOOR'],
    ['8.4.26', 'MATCHES_PUBLISHED_AFFECTED_RANGE'],
    ['8.4.27', 'MEETS_PUBLISHED_VERSION_FLOOR'],
    ['8.4.28', 'MEETS_PUBLISHED_VERSION_FLOOR'],
    ['8.5.11', 'MATCHES_PUBLISHED_AFFECTED_RANGE'],
    ['8.5.12', 'MEETS_PUBLISHED_VERSION_FLOOR'],
    ['8.5.13', 'MEETS_PUBLISHED_VERSION_FLOOR'],
  ];
  for (const [version, category] of cases) {
    const result = php(version);
    assert.equal(result.status, 0, `${version}: ${result.stderr}`);
    assert.match(result.stdout, new RegExp(`^${category}$`, 'm'), version);
  }
  const result = php('8.2.35');
  assert.match(result.stdout, /not.*(?:clean|exploitation)/i);
  assert.match(result.stdout, /distributor.*advisory/i);
  assert.match(result.stdout, /https:\/\/www\.php\.net\/archive\/2026\.php#2026-10-21-5/);
  assert.match(result.stdout, /2026-10-22/);
});

test('PHP keeps legacy and unknown future branches out of the version-floor category', () => {
  for (const version of ['5.6.40', '7.4.33', '8.0.30', '8.1.99']) {
    const result = php(version);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /^LEGACY_BRANCH_REVIEW_REQUIRED$/m, version);
    assert.match(result.stdout, /backport/i);
  }
  for (const version of ['8.6.0', '9.0.0', '99.99.99']) {
    const result = php(version);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /^UNKNOWN_BRANCH$/m, version);
    assert.doesNotMatch(result.stdout, /^MEETS_PUBLISHED_VERSION_FLOOR$/m);
  }
});

test('PHP rejects malformed or ambiguous inputs with usage and a nonzero status', () => {
  const cases = [
    [], ['8.2'], ['8.2.35.0'], ['v8.2.35'], ['8.2.35-1ubuntu1'],
    ['08.2.35'], ['8.02.35'], ['8.2.035'], [' 8.2.35'], ['8.2.35\n'],
    ['8.2.-1'], ['8.2.NaN'], ['9007199254740992.2.35'],
    ['8.2.35', '8.3.36'], ['$(touch /not-a-real-action)'],
  ];
  for (const args of cases) {
    const result = php(...args);
    assert.equal(result.status, 2, JSON.stringify(args));
    assert.match(result.stderr, /Usage:/);
  }
  assert.equal(php('--help').status, 0);
});

test('LiteLLM reports artifact metadata and generic markers without reading contents or running packages', (t) => {
  const root = fixture(t);
  const directory = join(root, 'site packages with spaces');
  mkdirSync(directory);
  mkdirSync(join(directory, 'litellm-1.107.0.dist-info'));
  mkdirSync(join(directory, 'litellm-1.107.1.dist-info'));
  mkdirSync(join(directory, 'litellm-odd name.dist-info'));
  const secret = 'SYNTHETIC_SECRET_MUST_NOT_APPEAR';
  for (const name of ['cook.pth', 'cook.py', 'sitecustomize.py']) {
    writeFileSync(join(directory, name), secret);
  }
  const bin = join(root, 'bin');
  mkdirSync(bin);
  const executed = join(root, 'package-executed');
  for (const command of ['python', 'python3', 'pip', 'pip3', 'php']) {
    const executable = join(bin, command);
    writeFileSync(executable, '#!/bin/bash\nprintf invoked > "$EXECUTION_SENTINEL"\nexit 99\n');
    chmodSync(executable, 0o755);
  }
  const result = inspect([directory], {
    env: { ...process.env, PATH: bin, EXECUTION_SENTINEL: executed },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /AFFECTED_ARTIFACT_METADATA\s+litellm-1\.107\.0\.dist-info/);
  assert.match(result.stdout, /OTHER_LITELLM_METADATA\s+litellm-1\.107\.1\.dist-info/);
  for (const name of ['cook.pth', 'cook.py', 'sitecustomize.py']) {
    assert.ok(result.stdout.includes(`MARKER_REVIEW_REQUIRED\t${name}`));
    assert.equal(readFileSync(join(directory, name), 'utf8'), secret);
  }
  assert.match(result.stdout, /litellm-odd\\ name\.dist-info/);
  assert.doesNotMatch(result.stdout + result.stderr, new RegExp(secret));
  assert.ok(!result.stdout.includes(root), 'must not print absolute filesystem paths');
  assert.ok(!existsSync(executed), 'must not start Python, pip or PHP');
  assert.match(result.stdout, /not.*(?:execution|executed)/i);
  assert.match(result.stdout, /not.*(?:conclusive|proof).*malware/i);
  assert.match(result.stdout, /2026-10-22/);
});

test('LiteLLM does not follow symlink entries or descend into nested directories', (t) => {
  const root = fixture(t);
  const directory = join(root, 'site-packages');
  const outside = join(root, 'outside-private-target');
  mkdirSync(directory);
  mkdirSync(outside);
  mkdirSync(join(directory, 'nested'));
  writeFileSync(join(outside, 'cook.pth'), 'SYNTHETIC_OUTSIDE_SECRET');
  writeFileSync(join(directory, 'nested', 'sitecustomize.py'), 'nested marker');
  symlinkSync(join(outside, 'cook.pth'), join(directory, 'cook.pth'));
  symlinkSync(outside, join(directory, 'litellm-1.107.0.dist-info'));
  const result = inspect([directory]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /NO_MATCHING_REGULAR_ENTRIES/);
  assert.match(result.stdout, /SYMLINK_ENTRIES_SKIPPED/);
  assert.doesNotMatch(result.stdout, /AFFECTED_ARTIFACT_METADATA|MARKER_REVIEW_REQUIRED/);
  assert.doesNotMatch(result.stdout + result.stderr, /outside-private-target|SYNTHETIC_OUTSIDE_SECRET/);
  assert.match(result.stdout, /absence.*(?:cannot|does not).*historical exposure/i);
});

test('LiteLLM rejects missing, non-directory and symlink roots, including extra arguments', (t) => {
  const root = fixture(t);
  const file = join(root, 'file');
  writeFileSync(file, 'not a directory');
  const link = join(root, 'linked-directory');
  symlinkSync(root, link);
  mkdirSync(join(root, 'nested'));
  for (const args of [
    [], [join(root, 'missing')], [file], [link], [`${link}/`],
    [`${link}/.`], [join(link, 'nested')], [root, root],
  ]) {
    const result = inspect(args);
    assert.equal(result.status, 2, JSON.stringify(args));
    assert.match(result.stderr, /Usage:|Error:/);
  }
  assert.equal(inspect(['--help']).status, 0);
});
