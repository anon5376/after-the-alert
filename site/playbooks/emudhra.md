# Remove trust in compromised eMudhra certificates

Updated 22 October 2026. Free operational guide.

Check every application's certificate trust source. A protected browser does not establish that command-line tools, containers or language runtimes reject the compromised keys.

## Does this apply?

Eight eMudhra intermediate CA keys were compromised through faulty generation; six were for TLS and two for code signing. Clients still trusting them could accept forged certificates. Mozilla's [trust-store advisory](https://seclists.org/oss-sec/2026/q4/233) explains the affected chains and why revocation alone is insufficient for clients that do not reliably enforce it.

## Choose your platform

| Surface | Action and limit |
|---|---|
| Chrome | The October 17 CRLSet block needed no restart. For websites, inspect your served chain: Google expects **emSign ECC Root CA - G3** removal on **October 27, morning PDT**. Replace certificates chaining to it with another trusted hierarchy before then. |
| Android | Google says Play Services delivered equivalent protection around October 19, 22:00 UTC. Restarting can trigger the update. Check managed-device delivery instead of assuming receipt. |
| Firefox | Standard configurations received OneCRL. Update custom configurations to **158.0.1**, **ESR 115.43.1**, **ESR 153.5.1**, or newer. Other NSS consumers need **3.131.1** or a documented backport. |
| Ubuntu | Update `ca-certificates`. Fixed builds are **20260816ubuntu0.22.04.1**, **20260816ubuntu0.24.04.1**, **20260816ubuntu0.26.04.1**, and **20260816ubuntu0.26.10.1** for those releases. Older systems have ESM-specific builds. Browser snaps update separately. |
| Windows | The original incident tracker reports automatic certificate trust-list blocks from October 20. Verify delivery; offline or update-disabled systems need managed remediation. |
| macOS command-line tools | The tracker distinguishes Apple's revocation protection from built-in `curl`, `git`, `python3`, `perl`, `ruby` and `openssl`, which read `/etc/ssl/cert.pem` without revocation checks. Built-in pip has another bundle. Use updated tooling or reviewed administrative remediation. |
| Bundled stores | Inventory each application/image. The tracker lists fixes including certifi **2026.10.19**, pip **26.2.2**, and curl's **2026-10-20** CA bundle. Rebuild shipped artifacts containing old stores. |

Google supplies the [Chrome, Android and website-operator guidance](https://blog.google/security/protecting-chrome-and-android-users-from-compromised-emudhra-intermediate-ca-certificates/). Mozilla supplies the [Firefox versions](https://blog.mozilla.org/security/2026/10/20/protecting-firefox-users-following-the-compromise-of-emudhra-intermediate-certificates/). Use [Ubuntu's release table](https://ubuntu.com/blog/emudhra-ca-compromise-fixes-available) and the [original coordination tracker](https://emudhra.we-have-a-problem.com/) for other packages and workarounds. Apple/Microsoft incident status here is attributed to that tracker.

## First actions

1. In the [asset inventory](/downloads/asset-inventory.csv), list each TLS client, owner, package version and actual trust source. Include services inside containers and application-specific bundles.
2. Apply the appropriate vendor update through your normal trusted channel. Record the package revision or managed-policy receipt.
3. Replace affected website certificate chains through your certificate-management process. Test the deployed chain on every serving endpoint you own.
4. Restart or redeploy consumers where needed to load changed trust data. Keep an owner against devices that cannot receive an update.

## Verify and close

Retain the inspected build/store identity, applied update and successful ordinary TLS integration checks. Where an administrator validates distrust, use the coordinator's offline chain procedure in a controlled environment. Confirm a certificate-validation rejection; a DNS or network error is not that result. Cover relevant cross-signed chains.

Close only the listed applications and stores. Keep unknown consumers open, with an owner and follow-up date.

## Avoid these mistakes

Do not disable TLS verification to repair broken connections. Broad root removal can also reject legitimate certificates; use vendor guidance and test compatibility. Do not run blanket system-file edits copied from a headline. CT-enforcing browser protection does not prove historical safety for every non-browser or code-signing use.
