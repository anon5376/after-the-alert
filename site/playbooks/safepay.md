# Prepare for SafePay and contain suspected ransomware

Updated 22 October 2026. Free operational guide.

Review internet-edge access, privileged identities and protected recovery copies now. If encryption or intrusion is underway, activate your incident plan and coordinate isolation before attempting cleanup or restoration.

## Does this apply?

CISA and partners' October 20 bulletin reports at least 600 organizations from critical-infrastructure sectors affected since August 2024 across several continents. It describes credential theft, phishing, brute force and vulnerable internet-facing systems, plus attacks on recovery copies. This is a cumulative campaign report, not a product advisory with one universal patch. See the [CISA SafePay bulletin](https://content.govdelivery.com/accounts/USDHSCISA/bulletins/42fd782).

## Prevention work for the IT owner

1. Inventory internet-facing VPNs, firewalls, remote-access services and administrative interfaces. Record product, deployed version, owner and vendor advisory in the [asset inventory](/downloads/asset-inventory.csv).
2. Prioritize applicable known-exploited vulnerabilities. Retain the installed version and deployment receipt, not only the change ticket.
3. Check whether remote and privileged accounts actually require multifactor authentication. Assign an owner and compensating control to exceptions. Review unused accounts and excessive administrative permissions.
4. Review who can delete or modify backup copies. Include the privileges available to production administrators and third-party management tools.
5. Restore a representative workload into an isolated test environment. Record data age, elapsed recovery time, dependency failures and the owner's acceptance. A successful backup job does not demonstrate recovery.

These checks turn the bulletin's patching, identity and privilege recommendations into an accountable work queue. Keep the test scope explicit; one successful restore does not certify every workload.

## If compromise is suspected

Use your approved incident-response plan and its designated lead. CISA's [ransomware response guide](https://www.cisa.gov/stopransomware/ransomware-guide) recommends identifying affected systems and promptly isolating them, with coordinated network action where multiple systems are involved. Use an independent communication channel if ordinary communications may be monitored.

Ask qualified responders to preserve volatile evidence, available logs and relevant disk/cloud snapshots. Coordinate collection with containment so collection does not prolong active harm. Avoid rebooting or wiping reflexively: losing memory and logs can remove evidence needed to establish scope. Escalate safety-critical or operational-technology isolation to the responsible operational team.

From a trusted administrative environment, identify credentials and remote-access paths implicated in the incident. Track revocation and replacement in the [credential worksheet](/downloads/credential-rotation.csv). Keep potentially affected backups separate from the environment under investigation.

## Conditions for recovery

Before reconnecting a restored service, the incident owner should record:

- What access path was contained and what remains unknown.
- Which identities, tokens and administrative privileges were addressed.
- Why the chosen recovery source and replacement environment are acceptable.
- Successful application, dependency and data-integrity checks.
- The monitoring plan, responsible owner and remaining incident obligations.

Restoring service is one milestone. It does not prove stolen data was recovered or persistence eliminated. Use the [response checklist](/downloads/response-checklist.txt) to preserve decisions and outstanding work.

## Pitfalls

Do not run an unverified decryptor or cleanup script on production data. A threat group's claimed file count is not a verified impact assessment. The steps here support preparation and coordination; complex ransomware recovery requires a qualified incident team with access to the evidence.
