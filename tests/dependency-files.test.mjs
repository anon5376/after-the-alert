import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../site/downloads/inspect-dependency-files.mjs', import.meta.url));
const secret = 'SYNTHETIC_SECRET_MUST_NOT_APPEAR';

function fixture(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'dependency-inputs-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return {
    root,
    write(name, content) {
      const path = join(root, name);
      writeFileSync(path, content);
      return path;
    },
  };
}

function run(...args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', env: { ...process.env, PATH: '' } });
}

function scan(paths, expectedStatus = 0) {
  const result = run('--json', ...paths);
  assert.equal(result.status, expectedStatus, result.stderr);
  assert.equal(result.stderr, '');
  assert.doesNotMatch(result.stdout, /SYNTHETIC_SECRET_MUST_NOT_APPEAR|"SAFE"|"CLEAN"/);
  for (const path of paths) assert.ok(!result.stdout.includes(path), 'must not print input paths');
  const report = JSON.parse(result.stdout);
  assert.ok(report.inputs.every(input => ['REVIEW', 'UNKNOWN'].includes(input.status)));
  return report;
}

const categories = input => input.findings.map(finding => finding.category);

test('requirements preserve affected declarations among other pins without exposing paths, options, or content', t => {
  const f = fixture(t);
  const requirements = f.write(`${secret}.txt`, `
# litellm==1.107.0 comment is not a declaration
requests==2.32.0
litellm[proxy]==1.107.0 ; python_version >= "3.10"
litellm==1.106.0
litellm>=1.107.1
litellm
litellm @ https://user:${secret}@example.invalid/archive.whl
--index-url https://user:${secret}@example.invalid/simple
-r nested-private-requirements.txt
litellm==1.107.0 \\
 --hash=sha256:${secret}
`);
  const [input] = scan([requirements]).inputs;
  assert.deepEqual(categories(input), [
    'AFFECTED_VERSION_DECLARATION', 'OTHER_EXACT_VERSION_DECLARATION',
    'UNPINNED_OR_RANGE_DECLARATION', 'UNRESOLVED_DEPENDENCY_DECLARATION',
  ]);
  assert.equal(input.findings[0].version, '1.107.0');
  assert.equal(input.findings[1].version, '1.106.0');
  assert.ok(input.notes.includes('REFERENCED_FILES_NOT_READ'));
  const plain = run(requirements);
  assert.equal(plain.status, 0);
  assert.doesNotMatch(plain.stdout + plain.stderr, new RegExp(secret));
  assert.ok(!plain.stdout.includes(f.root));
  assert.match(plain.stdout, /Declarations are not evidence of installation, deployment, or payload execution/);
});

test('pyproject supports dependency arrays and Poetry values without treating arbitrary strings or comments as dependencies', t => {
  const f = fixture(t);
  const pyproject = f.write('pyproject.toml', `
[project]
name = "example"
dependencies = [
  "requests==2.32.0",
  'litellm[proxy]==1.107.0', # declared version
  "litellm~=1.106.0",
]
[project.optional-dependencies]
api = ["litellm==1.107.1"]
[tool.poetry.dependencies]
litellm = { version = "1.105.0", optional = true }
[tool.poetry.group.dev.dependencies]
litellm = "^1.100.0"
[tool.private]
key = "${secret}"
description = "litellm==1.107.0"
`);
  const [input] = scan([pyproject]).inputs;
  assert.deepEqual(input.findings.filter(finding => finding.version).map(finding => finding.version), ['1.107.0', '1.107.1', '1.105.0']);
  assert.ok(categories(input).includes('UNPINNED_OR_RANGE_DECLARATION'));
  const comments = f.write('comments.txt', '# litellm==1.107.0\nrequests==2.32.0 # litellm==1.107.0\n');
  const commentInput = scan([comments]).inputs[0];
  assert.deepEqual(commentInput.findings, []);
  assert.ok(commentInput.notes.includes('NO_RECOGNIZED_LITELLM_DECLARATION'));
});

test('uv and Poetry lock package blocks keep package names paired with versions across multiple packages', t => {
  const f = fixture(t);
  const inputs = ['uv.lock', 'poetry.lock'].map(name => f.write(name, `
version = 1
[[package]]
name = "unrelated"
version = "1.107.0"
[[package]]
name = "litellm"
version = "1.106.0"
source = { registry = "https://user:${secret}@example.invalid/simple" }
[[package]]
name = "litellm"
version = "1.107.0"
[package.optional-dependencies]
proxy = []
[[package]]
name = "another-package"
version = "1.109.0"
`));
  for (const input of scan(inputs).inputs) {
    assert.deepEqual(input.findings, [
      { category: 'OTHER_EXACT_VERSION_DECLARATION', version: '1.106.0' },
      { category: 'AFFECTED_VERSION_DECLARATION', version: '1.107.0' },
    ]);
  }
});

test('Docker and Compose classify floating and explicit image tags while redacting registry credentials and arbitrary tags', t => {
  const f = fixture(t);
  const docker = f.write('Dockerfile', `
# FROM ghcr.io/berriai/litellm:1.107.0
FROM --platform=linux/amd64 user:${secret}@example.invalid/berriai/litellm:main-latest AS base
FROM example.invalid/berriai/litellm:main-v1.107.0
RUN pip install litellm==1.107.0
`);
  const compose = f.write('docker-compose.yml', `
services:
  a:
    image: "user:${secret}@example.invalid/berriai/litellm:v1.107.0"
  b:
    image: ghcr.io/berriai/litellm:main-stable
  c:
    image: ghcr.io/berriai/litellm
  d:
    image: ghcr.io/berriai/litellm-database:1.107.1
  e:
    image: ghcr.io/berriai/litellm:${secret}
  f:
    image: ghcr.io/berriai/litellm:latest
  g:
    image: ghcr.io/berriai/litellm:${'${VERSION}'}
`);
  const report = scan([docker, compose]);
  assert.deepEqual(categories(report.inputs[0]), ['FLOATING_IMAGE_REFERENCE', 'AFFECTED_IMAGE_REFERENCE']);
  assert.ok(report.inputs[0].notes.includes('DOCKER_BUILD_INPUTS_NOT_EVALUATED'));
  assert.deepEqual(report.inputs[0].findings[1], { category: 'AFFECTED_IMAGE_REFERENCE', image: 'litellm', tag: 'main-v1.107.0', version: '1.107.0' });
  assert.ok(categories(report.inputs[1]).includes('OTHER_VERSION_IMAGE_REFERENCE'));
  assert.ok(categories(report.inputs[1]).includes('UNRESOLVED_IMAGE_REFERENCE'));
  assert.ok(report.inputs[1].notes.includes('UNRESOLVED_IMAGE_REFERENCE'));
  assert.deepEqual(report.inputs.map(input => input.input), ['input1', 'input2']);
});

test('missing, unsupported, binary, non-UTF8, large, directory and symlink inputs remain UNKNOWN without exposing data', t => {
  const f = fixture(t);
  const regular = f.write('requirements.txt', 'litellm==1.107.0');
  const symlink = join(f.root, 'linked.txt');
  symlinkSync(regular, symlink);
  const directory = join(f.root, 'directory.txt');
  mkdirSync(directory);
  const paths = [
    join(f.root, `${secret}-missing.txt`),
    f.write('unsupported.json', `{"${secret}":"litellm==1.107.0"}`),
    f.write('binary.txt', Buffer.from([65, 0, 66])),
    f.write('nonutf8.txt', Buffer.from([0xc3, 0x28])),
    f.write('large.txt', Buffer.alloc(2 * 1024 * 1024 + 1, 65)),
    directory, symlink,
  ];
  const report = scan(paths, 2);
  assert.deepEqual(report.inputs.map(input => input.notes[0]), [
    'INPUT_READ_FAILED', 'UNSUPPORTED_FORMAT', 'BINARY_TEXT_REJECTED', 'NON_UTF8_REJECTED',
    'FILE_TOO_LARGE', 'NON_REGULAR_FILE_REJECTED', 'SYMLINK_REJECTED',
  ]);
  assert.ok(report.inputs.every(input => input.status === 'UNKNOWN' && input.findings.length === 0));
});

test('malformed inputs do not silently erase detected findings or turn unsupported syntax into clearance', t => {
  const f = fixture(t);
  const requirements = f.write('export.txt', 'litellm==1.107.0\nthis is not a requirement\n');
  const pyproject = f.write('pyproject.toml', '[project]\ndependencies = ["litellm==1.107.0", {include-group = "dev"}]\n');
  const lock = f.write('uv.lock', '[[package]]\nname = "litellm"\nversion = "1.107.0\n');
  const compose = f.write('compose.yaml', 'services: {api: {image: ghcr.io/berriai/litellm:1.107.0}}\n');
  const report = scan([requirements, pyproject, lock, compose], 2);
  assert.ok(report.inputs.every(input => input.status === 'UNKNOWN'));
  assert.ok(categories(report.inputs[0]).includes('AFFECTED_VERSION_DECLARATION'));
  assert.ok(categories(report.inputs[1]).includes('AFFECTED_VERSION_DECLARATION'));
  assert.ok(report.inputs[2].notes.includes('UNSUPPORTED_LOCK_PACKAGE'));
  assert.ok(report.inputs[3].notes.includes('UNSUPPORTED_COMPOSE_IMAGE_SYNTAX'));
  assert.match(report.limitations.join(' '), /cannot clear current or historical exposure/);
});

test('embedded scripts and multiline text are not reported as dependency or image declarations', t => {
  const f = fixture(t);
  const pyproject = f.write('pyproject.toml', '[project]\ndescription = """\n[project]\ndependencies = ["litellm==1.107.0"]\n"""\n');
  const docker = f.write('Dockerfile', 'FROM alpine:3.20\nRUN <<EOF\nFROM ghcr.io/berriai/litellm:1.107.0\nEOF\n');
  const compose = f.write('compose.yml', 'services:\n  app:\n    command: |\n      image: ghcr.io/berriai/litellm:1.107.0\n    image: alpine:3.20\n');
  const report = scan([pyproject, docker, compose], 2);
  assert.ok(report.inputs.every(input => input.findings.length === 0));
  assert.ok(report.inputs[0].notes.includes('MULTILINE_TOML_STRINGS_NOT_EVALUATED'));
  assert.ok(report.inputs[1].notes.includes('DOCKERFILE_HEREDOC_REMAINDER_NOT_EVALUATED'));
  assert.ok(report.inputs[2].notes.includes('COMPOSE_BLOCK_SCALARS_NOT_EVALUATED'));
});

test('help and argument errors describe scope without echoing input arguments', () => {
  const help = run('--help');
  assert.equal(help.status, 0);
  assert.match(help.stdout, /at most 2 MiB/);
  assert.match(help.stdout, /2026-10-22/);
  assert.match(help.stdout, /https:\/\/docs\.litellm\.ai\/blog\/security-incident-oct-21-2026/);
  for (const args of [[], ['--json'], [`--${secret}`]]) {
    const result = run(...args);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Usage:/);
    assert.doesNotMatch(result.stdout + result.stderr, new RegExp(secret));
  }
});
