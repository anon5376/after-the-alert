# Respond to Tor relay compromise and SSH interception

Updated 22 October 2026. Free operational guide.

Stop an SSH connection when its server identity changes unexpectedly. Relay operators should inspect host compromise as well as Tor configuration; removal of a relay from the network does not repair its host.

## Does this apply?

Tor confirmed on October 5 that compromised Linux relay hosts had their configurations changed to intercept SSH. An original researcher reported 333 affected exits, with interception beginning October 2 and removal activity on October 4–5. The report was published October 20. The original entry mechanism remains unknown. See the [Tor operator advisory](https://forum.torproject.org/t/tor-relays-security-incident-affecting-some-relay-operators/22231) and [original research](https://kaba.cx/posts/20261020_Tor/).

For users, the critical exposure is entering a password after accepting an attacker-controlled host key. This campaign does not establish that every Tor user or every SSH private key was compromised.

## If you saw an SSH warning

1. Stop before entering credentials. Record the destination, time, displayed fingerprint and warning without posting secrets.
2. Obtain the expected server host-key fingerprint through an independently trusted administrator or console. A fingerprint collected through the same suspect connection cannot authenticate that connection.
3. Compare the exact fingerprint and key type. Check whether an authorized rebuild or key rotation explains the change.
4. Resume only after establishing the server's identity. If you entered a password into the suspect session, use a trusted device and route to rotate it and any reused credentials. Ask the server owner to investigate the associated access.

OpenSSH documents host-key verification and checking behavior in its [SSH manual](https://man.openbsd.org/ssh#VERIFYING_HOST_KEYS) and [configuration reference](https://man.openbsd.org/ssh_config#StrictHostKeyChecking). Do not blanket-delete `known_hosts` or disable host-key checking to make a warning disappear. A first-time connection needs identity verification too.

## If you operate a relay

Compare the running host with your authorized baseline. Tor's advisory calls for reviewing unexpected Exit flags and exit policies, `torrc` and included configuration, port-22 redirection rules, unfamiliar network processes, altered binaries and persistence such as new accounts, keys, cron jobs or systemd services.

If compromise is suspected, Tor recommends taking the relay offline, preserving disk and logs, reinstalling, generating a new relay identity and rotating credentials present on the host. Plan evidence collection before replacement. This guide does not provide destructive cleanup commands or instructions to test unrelated relays.

## Verify and close

Use the [asset inventory](/downloads/asset-inventory.csv) and [credential-rotation worksheet](/downloads/credential-rotation.csv) to retain:

- The affected host, exposure period and evidence location.
- The rebuilt system's source and approved relay configuration.
- The new relay identity and completed credential revocations.
- The independently verified SSH host identity for any affected destination.
- Unresolved access, persistence or initial-entry questions and their owner.

A relay flag or clean-looking configuration alone cannot close host compromise. Have the incident owner decide when the rebuilt host can return, and use the Tor advisory's established operator channel for any network-block follow-up.
