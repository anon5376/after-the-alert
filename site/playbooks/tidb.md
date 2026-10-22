# Rotate TiDB Cloud management keys

Updated 22 October 2026. Free operational guide.

Replace active TiDB Cloud management API keys in every organization you own. **If you suspect misuse, revoke the affected key immediately**, even if an integration temporarily stops. Otherwise create a replacement, migrate and test its consumers, then promptly delete the old key.

## Does this apply?

PingCAP reports unauthorized access to internal systems between September 9 and October 7 using stolen service-account credentials. Copied records included customer metadata, SQL editor content, business information and encrypted management API-key values. Customer-specific impact and possible additional usable credentials remain under investigation. The vendor reports no evidence of impact to data stored in TiDB. The reported 10.6 TB total is unverified. See the [October 19 incident report](https://www.pingcap.com/trust-hub/security/security-update-october-2026/).

This procedure concerns **TiDB Cloud management API keys**. Database-user passwords and secrets pasted into support materials are separate credentials requiring their own exposure assessment.

## Prepare the rotation

An organization owner must perform key creation and deletion. Open the console through your established bookmark, not a link in an unexpected incident email.

Use the [credential-rotation worksheet](/downloads/credential-rotation.csv). For each organization, record key identifiers, role/scope, integration owner and consumers. Include scheduled automation and rarely run jobs. Store no passwords, private keys or tokens in the worksheet.

For suspected misuse, preserve the key identifier and available event times without delaying revocation. Use PingCAP's trusted incident channel for follow-up.

## Perform the vendor procedure

1. Select the target organization in the console's upper-left selector.
2. Open **Organization Settings → API Keys → Create API Key**.
3. Enter a description and choose the required role and scope.
4. Select **Generate API Key**. Save the public/private pair in your approved secret store. The private value is displayed only at creation; finish with **Done**.
5. Replace the old key in every dependent application, script and automation. Verify each consumer with the replacement.
6. Return to **Organization Settings → API Keys**. On the old key's row, select **… → Delete → I understand, delete it**.
7. Repeat for each organization. Revoke unused keys too.

For suspected misuse, perform deletion first and recover integrations afterward. These paths and their ordering come from PingCAP's [October 20 customer-actions notice](https://www.pingcap.com/trust-hub/security/customer-actions-october-2026/).

## Verify and close

- Record replacement and revoked key identifiers with timestamps.
- Confirm the old key is absent from the organization's active key list.
- Record an application check for every consumer, including a controlled run of scheduled work where appropriate.
- Review available logs from the incident period onward and retain unexplained activity for investigation.
- Confirm the responsible owner has addressed secrets previously placed in SQL editor text or support materials.

Complete rotation when every inventoried consumer works with its replacement and the old keys are revoked. Keep the exposure investigation separate; successful rotation does not determine which records were copied.

## Avoid these mistakes

Creating a replacement without deleting the original leaves old access available. Vendor rotation of its service-account credentials does not rotate your organization's keys. Verify unexpected payment changes or credential requests through an established channel, even when the sender knows accurate company details. Keep the [response checklist](/downloads/response-checklist.txt) with your receipts.
