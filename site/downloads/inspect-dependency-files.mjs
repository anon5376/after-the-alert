#!/usr/bin/env node
import { constants, lstatSync, openSync, fstatSync, readSync, closeSync } from 'node:fs';
import { basename } from 'node:path';
import { TextDecoder } from 'node:util';

const LIMIT = 2 * 1024 * 1024;
const SOURCE = 'https://docs.litellm.ai/blog/security-incident-oct-21-2026';
const NUMERIC = /^\d+(?:\.\d+){1,3}$/;
const LIMITATIONS = [
  'Declarations are not evidence of installation, deployment, or payload execution.',
  'This is a partial static parser. No recognized match cannot clear current or historical exposure.',
  'Only explicitly selected files are read. Includes, build commands, environment variables, and other environments are not resolved.',
  'Do not start Python or pip in a suspected environment; follow the vendor incident response guidance.',
];

function usage() {
  return `Usage: node inspect-dependency-files.mjs [--json] [--] FILE [FILE ...]
Read explicitly selected requirements .txt exports, pyproject.toml, uv.lock,
poetry.lock, Dockerfile, or docker-compose.yml/compose.yml files offline.
Each file must be regular UTF-8 text, at most 2 MiB. Symlink files are rejected.
No recursion, project imports, subprocesses, downloads, or network requests.
Output uses input1/input2 labels, fixed categories, and sanitized versions/images.
Every result is REVIEW or UNKNOWN. Exit 0 means inspection completed, not clearance.
Exit 2 means an input was rejected, unreadable, malformed, or unsupported.
Source snapshot: 2026-10-22\nSource: ${SOURCE}\n`;
}

function formatFor(path) {
  const name = basename(path).toLowerCase();
  if (name === 'pyproject.toml') return 'PYPROJECT';
  if (name === 'uv.lock' || name === 'poetry.lock') return 'LOCK';
  if (name === 'dockerfile' || name.startsWith('dockerfile.')) return 'DOCKERFILE';
  if (/^(?:docker-)?compose\.ya?ml$/.test(name)) return 'COMPOSE';
  if (name.endsWith('.txt')) return 'REQUIREMENTS';
  return 'UNSUPPORTED';
}

function commentless(line) {
  let quote = '';
  let escaped = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (escaped) { escaped = false; continue; }
    if (quote === '"' && c === '\\') { escaped = true; continue; }
    if (quote) { if (c === quote) quote = ''; }
    else if (c === '"' || c === "'") quote = c;
    else if (c === '#') return line.slice(0, i).trim();
  }
  return line.trim();
}

function tomlString(text, start = 0) {
  const quote = text[start];
  if ((quote !== '"' && quote !== "'") || text.slice(start, start + 3) === quote.repeat(3)) return null;
  let escaped = false;
  for (let i = start + 1; i < text.length; i++) {
    if (escaped) { escaped = false; continue; }
    if (quote === '"' && text[i] === '\\') { escaped = true; continue; }
    if (text[i] === quote) {
      try {
        const value = quote === '"' ? JSON.parse(text.slice(start, i + 1)) : text.slice(start + 1, i);
        return { value, end: i + 1 };
      } catch { return null; }
    }
  }
  return null;
}

function scalar(text) {
  const parsed = tomlString(text);
  return parsed && !text.slice(parsed.end).trim() ? parsed.value : null;
}

function inspect(path, index) {
  const result = { input: `input${index + 1}`, format: formatFor(path), status: 'REVIEW', findings: [], notes: [] };
  const note = (category, unknown = false) => {
    if (!result.notes.includes(category)) result.notes.push(category);
    if (unknown) result.status = 'UNKNOWN';
  };
  const add = (category, details = {}) => {
    const finding = { category, ...details };
    if (!result.findings.some(existing => JSON.stringify(existing) === JSON.stringify(finding))) result.findings.push(finding);
  };
  const version = value => {
    if (NUMERIC.test(value)) add(value === '1.107.0' ? 'AFFECTED_VERSION_DECLARATION' : 'OTHER_EXACT_VERSION_DECLARATION', { version: value });
    else add('UNRESOLVED_DEPENDENCY_DECLARATION');
  };
  const dependency = (value, poetry = false) => {
    let constraint;
    if (poetry) constraint = value.trim();
    else {
      const match = value.match(/^litellm(?:\[[A-Za-z0-9_, .-]+\])?(?=\s|[<>=!~@;(]|$)(.*)$/i);
      if (!match) return;
      constraint = match[1].split(';')[0].replace(/\s+--hash=\S+/g, '').trim();
      if (constraint.startsWith('(') && constraint.endsWith(')')) constraint = constraint.slice(1, -1).trim();
    }
    if (poetry && NUMERIC.test(constraint)) { version(constraint); return; }
    const exact = constraint.match(/^={2,3}\s*(\d+(?:\.\d+){1,3})$/);
    if (exact) version(exact[1]);
    else if (!constraint || /^(?:[<>=!~^]|\*|\d)/.test(constraint)) add('UNPINNED_OR_RANGE_DECLARATION');
    else add('UNRESOLVED_DEPENDENCY_DECLARATION');
  };
  const image = value => {
    if (/[${}\s]/.test(value)) { note('UNRESOLVED_IMAGE_REFERENCE'); return; }
    const tail = value.slice(value.lastIndexOf('/') + 1);
    const match = tail.match(/^(litellm(?:-database)?)(?::([^@]+))?(?:@sha256:[a-f0-9]{64})?$/i);
    if (!match) {
      if (/litellm/i.test(tail)) note('UNRESOLVED_IMAGE_REFERENCE');
      return;
    }
    const name = match[1].toLowerCase();
    const tag = match[2];
    const digest = /@sha256:/.test(tail);
    if (!tag) {
      if (digest) add('DIGEST_IMAGE_REVIEW_REQUIRED', { image: name });
      else add('FLOATING_IMAGE_REFERENCE', { image: name, tag: 'latest' });
    } else if (['latest', 'main-latest', 'main-stable'].includes(tag)) {
      add('FLOATING_IMAGE_REFERENCE', { image: name, tag });
    } else {
      const pinned = tag.match(/^(?:main-)?v?(\d+(?:\.\d+){1,3})$/);
      if (pinned) add(pinned[1] === '1.107.0' ? 'AFFECTED_IMAGE_REFERENCE' : 'OTHER_VERSION_IMAGE_REFERENCE', { image: name, tag, version: pinned[1] });
      else add('UNRESOLVED_IMAGE_REFERENCE', { image: name });
    }
  };

  if (result.format === 'UNSUPPORTED') { note('UNSUPPORTED_FORMAT', true); return result; }
  let fd;
  let text;
  try {
    const entry = lstatSync(path);
    if (entry.isSymbolicLink()) { note('SYMLINK_REJECTED', true); return result; }
    if (!entry.isFile()) { note('NON_REGULAR_FILE_REJECTED', true); return result; }
    if (entry.size > LIMIT) { note('FILE_TOO_LARGE', true); return result; }
    fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const opened = fstatSync(fd);
    if (!opened.isFile() || opened.dev !== entry.dev || opened.ino !== entry.ino) { note('FILE_CHANGED_OR_NON_REGULAR', true); return result; }
    if (opened.size > LIMIT) { note('FILE_TOO_LARGE', true); return result; }
    const buffer = Buffer.alloc(LIMIT + 1);
    let size = 0;
    let count;
    do { count = readSync(fd, buffer, size, buffer.length - size, null); size += count; } while (count && size < buffer.length);
    if (size > LIMIT) { note('FILE_TOO_LARGE', true); return result; }
    const bytes = buffer.subarray(0, size);
    if (bytes.some(byte => byte === 0 || (byte < 32 && ![9, 10, 13].includes(byte)))) { note('BINARY_TEXT_REJECTED', true); return result; }
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
    catch { note('NON_UTF8_REJECTED', true); return result; }
  } catch {
    note('INPUT_READ_FAILED', true);
    return result;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
  const rawLines = text.split(/\r?\n/);
  let lines = rawLines.map(commentless);
  if (['PYPROJECT', 'LOCK'].includes(result.format)) {
    let delimiter = '';
    lines = lines.map(line => {
      if (delimiter) {
        if (line.includes(delimiter)) delimiter = '';
        return '';
      }
      const triple = line.match(/"""|'''/);
      if (!triple) return line;
      note('MULTILINE_TOML_STRINGS_NOT_EVALUATED');
      if (!line.slice(triple.index + 3).includes(triple[0])) delimiter = triple[0];
      return '';
    });
    if (delimiter) note('INCOMPLETE_TOML_MULTILINE_STRING', true);
  }
  if (result.format === 'REQUIREMENTS') {
    let pending = '';
    for (const line of lines) {
      pending += line;
      if (pending.endsWith('\\')) { pending = pending.slice(0, -1) + ' '; continue; }
      const requirement = pending.trim();
      pending = '';
      if (!requirement) continue;
      if (/^(?:-r|-c|--requirement|--constraint)(?:\s|=|[^-])/.test(requirement)) note('REFERENCED_FILES_NOT_READ');
      else if (requirement.startsWith('-')) note('REQUIREMENT_OPTIONS_NOT_EVALUATED');
      else if (/^[A-Za-z0-9][A-Za-z0-9_.-]*(?:\[[A-Za-z0-9_, .-]+\])?(?:\s*(?:[<>=!~@;(].*)?)?$/.test(requirement)) dependency(requirement);
      else note('UNSUPPORTED_REQUIREMENT_SYNTAX', true);
    }
    if (pending.trim()) note('INCOMPLETE_REQUIREMENT_CONTINUATION', true);
  } else if (result.format === 'LOCK') {
    let block = null;
    let packages = 0;
    const flush = () => {
      if (!block) return;
      if (!block.name || block.invalid) note('UNSUPPORTED_LOCK_PACKAGE', true);
      else if (block.name.toLowerCase() === 'litellm') {
        if (block.version === undefined) add('UNRESOLVED_DEPENDENCY_DECLARATION');
        else version(block.version);
      }
    };
    for (const line of lines) {
      if (!line) continue;
      if (line.startsWith('[')) {
        flush();
        block = line === '[[package]]' ? {} : null;
        if (block) packages++;
        continue;
      }
      const field = line.match(/^(name|version)\s*=\s*(.*)$/);
      if (block && field) {
        const value = scalar(field[2]);
        if (value === null || Object.hasOwn(block, field[1])) block.invalid = true;
        else block[field[1]] = value;
      }
    }
    flush();
    if (!packages) note('NO_SUPPORTED_LOCK_PACKAGES', true);
  } else if (result.format === 'PYPROJECT') {
    let section = '';
    let array = '';
    const parseArray = value => {
      let position = 1;
      let expectValue = true;
      while (position < value.length) {
        if (/\s/.test(value[position])) { position++; continue; }
        if (value[position] === ']' && !value.slice(position + 1).trim()) return;
        if (!expectValue && value[position] === ',') { expectValue = true; position++; continue; }
        const parsed = expectValue && tomlString(value, position);
        if (!parsed) { note('UNSUPPORTED_DEPENDENCY_ARRAY', true); return; }
        dependency(parsed.value);
        position = parsed.end;
        expectValue = false;
      }
      note('INCOMPLETE_DEPENDENCY_ARRAY', true);
    };
    for (const line of lines) {
      if (!line) continue;
      if (array) {
        if (/^\[\[?[A-Za-z]/.test(line)) { note('INCOMPLETE_DEPENDENCY_ARRAY', true); array = ''; }
        else { array += ` ${line}`; if (line.endsWith(']')) { parseArray(array); array = ''; } continue; }
      }
      const header = line.match(/^\[([^\[\]]+)\]$/);
      if (header) { section = header[1].trim(); continue; }
      const field = line.match(/^([A-Za-z0-9_.-]+|"[^"]+"|'[^']+')\s*=\s*(.*)$/);
      if (!field) { if (/dependenc|litellm/i.test(line)) note('UNSUPPORTED_TOML_SYNTAX', true); continue; }
      const key = field[1].replace(/^["']|["']$/g, '');
      const value = field[2];
      if ((section === 'project' && key === 'dependencies') || ['project.optional-dependencies', 'dependency-groups'].includes(section)) {
        if (!value.startsWith('[')) note('UNSUPPORTED_DEPENDENCY_ARRAY', true);
        else if (value.endsWith(']')) parseArray(value);
        else array = value;
      } else if (/^tool\.poetry\.(?:(?:group\.[^.]+\.)?dependencies|dev-dependencies)$/.test(section) && key.toLowerCase() === 'litellm') {
        const simple = scalar(value);
        if (simple !== null) dependency(simple, true);
        else if (value.startsWith('{') && value.endsWith('}')) {
          const versionField = value.match(/(?:^\{|,)\s*version\s*=\s*((?:"(?:[^"\\]|\\.)*"|'[^']*'))(?=\s*[,}])/);
          if (versionField) dependency(scalar(versionField[1]), true);
          else add('UNRESOLVED_DEPENDENCY_DECLARATION');
        } else { add('UNRESOLVED_DEPENDENCY_DECLARATION'); note('UNSUPPORTED_POETRY_DECLARATION', true); }
      } else if (section === 'project' && key === 'dynamic') note('DYNAMIC_PROJECT_FIELDS_NOT_RESOLVED');
    }
    if (array) note('INCOMPLETE_DEPENDENCY_ARRAY', true);
  } else if (result.format === 'DOCKERFILE') {
    for (const line of lines) {
      if (/^(?:RUN|COPY|ADD)\s/i.test(line) && line.includes('<<')) {
        note('DOCKERFILE_HEREDOC_REMAINDER_NOT_EVALUATED', true);
        break;
      }
      if (/^FROM\s/i.test(line)) {
        const from = line.match(/^FROM\s+(?:--platform=\S+\s+)?(\S+)(?:\s+AS\s+\S+)?$/i);
        if (from) image(from[1]);
        else note('UNSUPPORTED_FROM_SYNTAX', true);
      } else if (/^(?:RUN|ARG|ENV|COPY|ADD)\s/i.test(line)) note('DOCKER_BUILD_INPUTS_NOT_EVALUATED');
    }
  } else if (result.format === 'COMPOSE') {
    let blockIndent = -1;
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (!line) continue;
      const indent = rawLines[index].match(/^\s*/)[0].length;
      if (blockIndent >= 0 && indent > blockIndent) continue;
      blockIndent = -1;
      if (/^[^:]+:\s*[|>][+\-\d]*$/.test(line)) {
        blockIndent = indent;
        note('COMPOSE_BLOCK_SCALARS_NOT_EVALUATED');
        continue;
      }
      const field = line.match(/^image\s*:\s*(.*)$/);
      if (!field) { if (/\bimage\s*:/.test(line)) note('UNSUPPORTED_COMPOSE_IMAGE_SYNTAX', true); continue; }
      const value = field[1];
      if (!value || /^[&*!>|]/.test(value)) note('UNRESOLVED_IMAGE_REFERENCE');
      else if (/^["']/.test(value)) {
        const quoted = scalar(value);
        if (quoted === null) note('UNSUPPORTED_COMPOSE_IMAGE_SYNTAX', true);
        else image(quoted);
      } else image(value);
    }
    note('COMPOSE_MERGES_AND_BUILD_INPUTS_NOT_EVALUATED');
  }
  if (!result.findings.length) note('NO_RECOGNIZED_LITELLM_DECLARATION');
  note('PARTIAL_STATIC_PARSE_REVIEW_REQUIRED');
  return result;
}

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === '--help') {
  process.stdout.write(usage());
} else {
  let json = false;
  let literal = false;
  let invalid = false;
  const paths = [];
  for (const argument of args) {
    if (!literal && argument === '--') literal = true;
    else if (!literal && argument === '--json') json = true;
    else if (!literal && argument.startsWith('-')) invalid = true;
    else paths.push(argument);
  }
  if (invalid || !paths.length) { process.stderr.write(usage()); process.exitCode = 2; }
  else {
    const report = { asOf: '2026-10-22', source: SOURCE, inputs: paths.map(inspect), limitations: LIMITATIONS };
    if (json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    else {
      process.stdout.write(`AS_OF\t${report.asOf}\nSOURCE\t${report.source}\n`);
      for (const input of report.inputs) {
        process.stdout.write(`${input.input}\t${input.format}\t${input.status}\n`);
        for (const finding of input.findings) process.stdout.write(`${input.input}\t${Object.values(finding).join('\t')}\n`);
        for (const note of input.notes) process.stdout.write(`${input.input}\t${note}\n`);
      }
      process.stdout.write(`${LIMITATIONS.join('\n')}\n`);
    }
    if (report.inputs.some(input => input.status === 'UNKNOWN')) process.exitCode = 2;
  }
}
