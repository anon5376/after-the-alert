# Railway: revoke credentials at the issuer, then update every consumer

Operator playbook · checked 22 October 2026 · owner: __________ · workspace: __________

## Two-minute applicability check

Railway's 21 October disclosure recommends rotation of stored environment variables and private-registry credentials for all customers as a precaution. It says some decrypted values may have been accessed; it does not confirm every account was breached. Check the [current disclosure](https://blog.railway.com/p/security-disclosure-wednesday-october-21st) and [live status](https://status.railway.com/) before scheduling deployments.

For every workspace/project, enumerate production, staging and preview environments; services, workers and cron jobs; shared variables, copied connection strings and private-registry authentication. Add external consumers: CI, local automation, monitoring, backup jobs and other hosts. Record **variable name, issuer, key ID, owner, consumers and last deployment**, never the secret value. URLs and nonsecret settings need review, not arbitrary replacement.

## Decide containment and preserve evidence

Use a trusted device. Preserve deployment IDs, existing audit/authentication logs, issuer activity and billing before retention expires. If active abuse is suspected, disable the credential at its issuer immediately and accept the resulting outage. If deployments remain blocked, issuer-side revocation still works; record services awaiting replacement. A variable edit cannot invalidate a stolen credential.

Create one row per credential with states: **inventoried → issuer disabled/revoked → replacement stored → consumers deployed → verified**. Track short-lived sessions separately. Keep evidence and replacement values in your existing private credential store, not this worksheet.

## Use the correct issuer branch

**AWS IAM user access keys.** In IAM, locate the user by key ID; open **Security credentials → Access keys**. Create the replacement if needed, then choose **Actions → Deactivate** on the exposed key. Update both Railway AWS variables and every external consumer. Verify the old key is inactive and new application calls succeed. Review CloudTrail Event history filtered by key ID in every region and review billing. Delete the old key after preserving the receipt and completing the review. Do not reactivate an exposed key to fix a missed consumer. [Railway AWS procedure](https://blog.railway.com/p/security-disclosure-recommendation-check-for-anomalous-aws-access), [AWS key management](https://docs.aws.amazon.com/IAM/latest/UserGuide/id-credentials-access-keys-update.html)

**Google Cloud service-account keys.** Locate the owning account and key ID. Generate a replacement through **Service accounts → account → Keys**; disable the exposed key through Google's documented CLI. Key disablement blocks new authentication, but already-issued tokens can remain valid. If immediate cutoff is required, follow the service-account disable/deny procedure, including the documented waiting period, and account for all workloads sharing it. Review IAM changes, Audit Logs and billing. [Railway GCP procedure](https://blog.railway.com/p/security-disclosure-recommendation-check-for-anomalous-gcp-access)

**Railway's MySQL template.** Choose **MySQL service → Database → Config → Connection → password → Regenerate**. This changes the database password and related variables and restarts the database. It does **not** redeploy every dependent service. Redeploy consumers of references and replace copied URLs/external-client credentials. Do not just edit `MYSQL_ROOT_PASSWORD` or run an unrelated password command: that can leave database and variables inconsistent. This branch applies to the documented template; other database setups need their own issuer procedure. [Railway MySQL rotation](https://blog.railway.com/p/security-disclosure-recommendation-rotate-mysql-database-credentials)

**Docker Hub registry token.** For a personal token: **Docker Home → avatar → Account settings → Personal access tokens → token actions → Deactivate**. Create a replacement with only required access, update Railway's registry authentication and verify a fresh private-image pull. Organization tokens instead live under **organization → Identity & auth → Access tokens**. Record old-token status; the token's name alone is not a revocation receipt. [Personal tokens](https://docs.docker.com/security/access-tokens/personal-access-tokens/), [Organization tokens](https://docs.docker.com/security/access-tokens/organization-access-tokens/)

**GitHub PAT.** Create a suitably scoped replacement, then remove the exposed token in **Settings → Developer settings → Personal access tokens → matching token type → Delete**. Update every consumer, including registry access if applicable. Deleting a PAT can also delete deploy keys created with it: check that dependency. OAuth/App credentials require their own revocation path. [GitHub token management](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

For other API keys, database passwords, signing keys or session secrets, open the issuing service's current rotation guide. Identify whether rotation invalidates sessions or requires a separate revoke operation; record that operation explicitly.

## Deploy and prove the result

1. Edit each service's **Variables**, or the shared variable in project settings. Review affected services and **deploy staged changes**; saving a value alone does not apply it. Replace hard-coded/copied consumers separately. [Railway variables](https://docs.railway.com/variables)
2. Confirm every consumer's new deployment is active. Test the specific dependent operation: database query, object read, private-registry build or restricted API request. Read authentication failures; a service healthcheck can pass without exercising the rotated credential.
3. Read back issuer status for the old credential and retain the change timestamp/identifier. Review issuer logs and billing for misuse. Missing logs leave historical exposure unknown.

**Failure/rollback:** stop the affected operation or issue another new credential; do not restore the exposed value. Escalate unidentified consumers, missing issuer permissions or suspicious new resources. **Output limit:** no `env`, variable dumps, connection URLs, authorization headers or raw secret-bearing logs in the record.

- [ ] Every project/environment and external consumer listed.
- [ ] Each old credential disabled/revoked at its issuer.
- [ ] Sessions handled where separate revocation is required.
- [ ] Every consumer redeployed and its actual integration tested.
- [ ] Issuer receipts retained; misuse findings and deployment blockers assigned.
