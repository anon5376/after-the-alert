# Respond to an exposed Plex server

Updated 22 October 2026. Free operational guide.

Update Plex Media Server to **1.43.3.10861 or newer** and assess whether the old installation was compromised. An update does not revoke a stolen account token or remove existing persistence.

## Does this apply?

Plex confirmed widespread exploitation on 19 October. Four vulnerabilities, collectively called Plex2Shell, can permit unauthenticated code execution with the server process's privileges. Plex says an older internet-reachable server should be treated as potentially compromised. This includes NAS installations whose package stores lag behind Plex releases. See the [vendor incident notice](https://forums.plex.tv/t/important-security-update-for-plex-media-server-v1-43-2-and-earlier/942319/3).

## First actions

1. Open Plex Web, select the affected server, then **Settings → General**. Record its complete version in the [asset inventory](/downloads/asset-inventory.csv).
2. Record whether the server was reachable from the internet and through which router, proxy or remote-access configuration. Record the period of exposure where known.
3. Disable unneeded access under **Settings → Remote Access**. Check router forwarding separately; changing one setting is not evidence that every route is closed.
4. Update from the official Plex distribution for your platform. On a NAS, check Plex's manual installation instructions if the device's app store has no current package.
5. Review unexpected child processes, unfamiliar `.so` or `.dll` files in Codecs, and unexplained CPU or network activity. Preserve relevant logs and observations before rebuilding.

Plex recommends a clean installation without reusing the old Plex data directory when compromise is indicated or cannot be excluded. Plan that rebuild with your backup and evidence needs in mind; this guide supplies no destructive cleanup command.

## Revoke account access deliberately

From a trusted device, open the top-right user menu in Plex Web and choose **Account Settings**. Change the password and select **Sign out connected devices after password change**. Plex documents that this invalidates existing tokens and signs apps and servers out; expect to authenticate them again. See [Plex account management](https://support.plex.tv/articles/201862428-plex-accounts/) and [token invalidation](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/).

Review **Authorized Devices** afterward. Keep password and token values out of notes. Use the [credential-rotation worksheet](/downloads/credential-rotation.csv) to track identifiers, owners and completion times.

List what the Plex service account could access: media shares, writable mounts, backup locations and local secrets. Assign review and rotation work for that reachable scope. The account password change covers Plex authentication, not unrelated credentials stored on the host.

## Verify and close

- Confirm the replacement server's full version in **Settings → General**.
- Record the clean installation's origin and which data was restored.
- Confirm expected clients require fresh sign-in after token invalidation.
- Verify intended playback and the final remote-access configuration.
- Retain the decision on reachable shares and credentials, including unresolved exposure.

Close patching separately from compromise assessment. No visible miner and normal CPU usage are insufficient evidence to declare the host clean.

## Sources

[Plex platform-update instructions](https://forums.plex.tv/t/important-security-update-for-plex-media-server-v1-43-2-and-earlier/942319/) cover Windows, macOS, NAS and Shield. [Plex device management](https://support.plex.tv/articles/115007577087-devices/) explains the authorized-device list. CISA added the four vulnerabilities on 20 October in its [official KEV catalog data](https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json).
