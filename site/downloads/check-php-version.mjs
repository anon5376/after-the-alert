#!/usr/bin/env node

const usage = `Usage: node check-php-version.mjs X.Y.Z

Supply one upstream PHP version, for example: 8.3.36
Use digits only, with no prefix, suffix, spaces, or leading zeroes.
For a distribution package, check the distributor advisory for backports.
This tool never starts PHP, reads files, runs subprocesses, or uses the network.
Exit 0 means a classification completed, not that a host is safe. Input errors: 2.
`;

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === '--help') {
  process.stdout.write(usage);
} else {
  const match = args.length === 1
    ? /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/.exec(args[0])
    : null;
  const parts = match?.slice(1).map(Number);
  if (!match || match[0] !== args[0] || !parts.every(Number.isSafeInteger)) {
    process.stderr.write(`Error: expected one strict numeric X.Y.Z version.\n${usage}`);
    process.exitCode = 2;
  } else {
    const [major, minor, patch] = parts;
    const fixed = { 2: 35, 3: 36, 4: 27, 5: 12 };
    let category;
    let explanation;
    if (major < 8 || (major === 8 && minor < 2)) {
      category = 'LEGACY_BRANCH_REVIEW_REQUIRED';
      explanation = 'No version-only clearance for this legacy branch. Vendor or distribution backports may exist; inspect the applicable advisory and build provenance.';
    } else if (major === 8 && Object.hasOwn(fixed, minor)) {
      const floor = `8.${minor}.${fixed[minor]}`;
      category = patch < fixed[minor]
        ? 'MATCHES_PUBLISHED_AFFECTED_RANGE'
        : 'MEETS_PUBLISHED_VERSION_FLOOR';
      explanation = `Published upstream fixed-version floor for this branch: ${floor}.`;
    } else {
      category = 'UNKNOWN_BRANCH';
      explanation = 'This branch is outside this dated advisory table. No safety conclusion is available.';
    }
    process.stdout.write(`${category}\nVERSION\t${args[0]}\nAS_OF\t2026-10-22\n${explanation}\n`);
    process.stdout.write('This result is not proof of a clean host, absence of exploitation, or the build currently serving requests.\n');
    process.stdout.write('For distribution backports, check the distributor package advisory; a lower upstream number may include a fix.\n');
    process.stdout.write('Source: https://www.php.net/archive/2026.php#2026-10-21-5\n');
    process.stdout.write('Exit 0 means classification completed; it does not mean safe.\n');
  }
}
