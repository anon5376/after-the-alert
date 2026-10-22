# PHP: replace the web runtime and prove what serves requests

Operator playbook · checked 22 October 2026 · owner: __________ · service: __________

## Two-minute applicability check

List every website, API, scheduled worker and replica using PHP. Identify its hosting provider, operating system, installation source and web handler: Apache module, FPM, CGI, LiteSpeed or another runtime. Do not infer these from a response banner.

For CVE-2026-109618 and CVE-2026-109619, PHP identifies web-serving installations as at risk. Upstream fixes are **8.2.35, 8.3.36, 8.4.27 and 8.5.12**; earlier builds within those branches need remediation. Older branches require a documented vendor backport or migration. These floors apply to these two flaws, not every possible PHP vulnerability. [PHP advisory](https://www.php.net/archive/2026.php#2026-10-21-5)

## Contain now

If an exposed runtime cannot promptly receive a verified fix, have the service owner withdraw its public route or put a static maintenance response at the proxy, before requests reach PHP. An application-level maintenance plugin still invokes PHP. Keep private administrative access. Record the downtime decision and time.

Do not improvise memory-limit changes: PHP says its interim configuration measures only reduce particular attack paths. An update is the complete vendor remedy for these flaws. Preserve logs before retention expires; suspected exploitation needs incident response alongside patching. [PHP advisory](https://www.php.net/archive/2026.php#2026-10-21-5)

## Preserve and identify

Retain the deployment identifier, image digest or package name/build, provider advisory, relevant access/error logs and restart time. Keep configuration backups private; do not paste their contents into tickets.

**Debian/Ubuntu packages:** read the web-server configuration to identify the actual FPM pool/socket or Apache module. Find its package, then query only that package. Replace the capitalized placeholder; this command reads the package database, not PHP:

```sh
dpkg-query -W -f='${binary:Package}\t${Version}\t${db:Status-Status}\n' 'EXACT_PHP_PACKAGE'
```

Expected: one package, full version and `installed`. Missing package or another state means the runtime mapping remains unresolved. A package receipt does not prove old workers exited. Match the full build against your distributor's security notice; backports can retain an older-looking upstream number. [Debian command reference](https://manpages.debian.org/bookworm/dpkg/dpkg-query.1.en.html)

**Managed hosting:** use the host's per-site runtime page and obtain its exact patched build/redeployment receipt. **Containers:** retain the immutable digest and build receipt for every deployed revision. **Source/Windows builds:** use PHP's official downloads and installation documentation for that platform, keeping the selected release/checksum and extension compatibility record. [PHP downloads and installation links](https://www.php.net/downloads.php)

## Remediate, then read back

1. Choose the fixed patch in the existing supported branch where possible. Test your normal application release checks with its extensions and configuration. Back up application data using the application's established procedure; prepare a patched fallback image or maintenance route.
2. Apply the matching distributor/hosting/container procedure. Update the web handler and relevant extensions, not merely the CLI package. For example, Heroku explicitly requires an application redeploy to obtain these fixed runtimes. Its 8.1 backport is described as a minimal mitigation, not a supported release. [Heroku incident instructions](https://devcenter.heroku.com/changelog-items/3845)
3. Restart or replace the actual PHP-serving processes through their service manager/orchestrator. For mod_php that includes Apache workers; for FPM, every serving pool. Drain old replicas and confirm none still receive traffic. Preserve the resulting deployment/process timestamps.
4. Obtain version and SAPI through the same HTTP execution path as production. Prefer an existing authenticated diagnostics feature. If none exists, an administrator can briefly expose **only** `phpversion()` and `php_sapi_name()` through a private, access-controlled diagnostic route; restrict access at the proxy before PHP runs. Record the two values per backend, then remove the route. Do not publish `phpinfo()` or environment/configuration dumps. A `cli` result or a cache response does not identify the web worker. [Version function](https://www.php.net/manual/en/function.phpversion.php), [SAPI function](https://www.php.net/manual/en/function.php-sapi-name.php)
5. Test an uncached dynamic page, sign-in, a representative database read, and one reversible application write with a test account. Confirm the resulting record can be read back. Exercise uploads and background work if used. Record expected/actual results and check new application errors; a homepage HTTP 200 alone is insufficient.

## Debian execution template for step 2

For **Debian/Ubuntu**, after selecting the distributor's fixed build, replace both placeholders below and add any required sibling PHP/extension packages explicitly. Run one command at a time; stop on errors. Review the simulation for removals, downgrades or branch changes before applying. [APT command reference](https://manpages.debian.org/bookworm/apt/apt-get.8.en.html)

```sh
sudo apt-get update
```

Stop if refreshing the package index fails. Then run the simulation only:

```sh
sudo apt-get --simulate install --only-upgrade 'EXACT_PHP_PACKAGE=VERIFIED_BUILD'
```

**Review gate:** stop on errors. Inspect the complete simulation for removals, downgrades, branch changes and required sibling packages. Continue only when the authorized operator accepts that exact plan. The next command performs the real installation:

```sh
sudo apt-get install --only-upgrade 'EXACT_PHP_PACKAGE=VERIFIED_BUILD'
```

This does not replace the worker restart and HTTP verification above.

## Failure, output limits and completion

If a worker reports an old build, keep it out of rotation and fix its deployment mapping. If the application fails, retain errors and use maintenance mode or a tested patched fallback. Do not restore a vulnerable public runtime merely to remove an error. Escalate unavailable vendor fixes, unsupported extensions or unexplained changes to the responsible host/runtime administrator.

Keep terminal output to package/build identifiers and the two diagnostic values. Share no raw configuration or customer requests. Output establishes build identity and behavior at a time; earlier compromise remains unknown without investigation.

- [ ] Every site, pool and replica mapped to its runtime.
- [ ] Fixed upstream release or exact vendor backport documented.
- [ ] All old workers replaced; private HTTP receipt retained.
- [ ] Dynamic read/write and critical integrations pass.
- [ ] Diagnostic route removed; unresolved exposure questions assigned.

Operational sequence is editorial synthesis. Recheck linked vendor guidance before executing.
