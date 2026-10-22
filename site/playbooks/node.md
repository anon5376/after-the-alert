# Update Node.js across the deployed fleet

Updated 22 October 2026. Free operational guide.

Upgrade affected Node.js runtimes, redeploy applications that carry their own runtime, and verify the running processes. Updating a developer laptop leaves deployed services unchanged.

## Does this apply?

The 21 October security release fixes **CVE-2026-111497**, a High-severity Brotli decoder flaw permitting remote code execution and several TLS hostname-validation defects. The Brotli issue and loose-IP hostname bypass affect supported lines 22, 24 and 26. The fullwidth-IP hostname bypass affects 24 and 26. Actual application exposure depends on which input reaches those functions. The advisory does not establish widespread exploitation. See the [Node.js security advisory](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).

| Runtime line | Fixed release |
|---|---|
| 22.x | 22.23.4 |
| 24.x | 24.22.1 |
| 26.x | 26.12.1 |

Use these floors or a later supported release. For a distribution package with backported fixes, retain its security advisory and package revision. An unsupported major version needs migration or a separately documented fix.

## First actions

1. Start an [asset inventory](/downloads/asset-inventory.csv). Give each service, scheduled job, container, build runner and embedded application an owner.
2. Record how each one starts: executable path, runtime version, deployment artifact, replica count and last deployment. Inspect the service configuration or deployment record. A version manager selected in your login shell may differ from the service configuration.
3. Use the [version checker](/tools.html#versions) to compare a known version with the published floor. It classifies the supplied version; it does not inspect a host.
4. Prioritize services processing untrusted compressed content or externally supplied TLS destinations. Record uncertain reachability instead of treating it as absence of exposure.
5. Obtain the patched runtime through your normal trusted release channel. Build a replacement artifact and run the application's normal staging checks before rollout.

For routine checks on a trusted installation, the official CLI supports:

```sh
node --version
```

This reports the executable selected in that environment. If compromise is suspected, preserve the host and use deployment records or an offline examination rather than trusting its executables.

## Deploy and verify

Replace every affected replica, worker and scheduled-job image. Restart processes through the normal deployment system so they load the replacement runtime. Check that a rollback would not silently restore an affected image.

For each asset, retain:

- The replacement image digest or package revision.
- The runtime version observed in the deployed environment after restart.
- Successful application checks covering startup, ordinary requests, outbound TLS and background work.
- Any failed check, the responsible owner and the next decision.

Close the upgrade when every in-scope asset has evidence or an explicitly accepted exception. Keep a separate incident investigation open if suspicious activity exists.

## Pitfalls and sources

The same releases update eMudhra certificate handling; applications using another trust store still need that store reviewed. A passing version comparison proves neither application compatibility nor absence of a past breach.

[Node.js command-line reference](https://nodejs.org/api/cli.html#-v---version) documents the version flag. [Release 26.12.1](https://nodejs.org/en/blog/release/v26.12.1/) lists its security and certificate changes. Keep the [response checklist](/downloads/response-checklist.txt) with the deployment record.
