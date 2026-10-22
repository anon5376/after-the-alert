# GitLab: patch through the required upgrade stops

Operator playbook · checked 22 October 2026 · owner: __________ · instance: __________

## Two-minute applicability check

Identify **Self-Managed, GitLab.com or Dedicated**, then the exact version, CE/EE edition, installation method, node count, external database/object storage and Geo use. GitLab says GitLab.com is patched; Dedicated builds 19.3.5-internal0 and 19.4.2-internal0 or later include these fixes. Obtain your managed deployment's current receipt instead of running self-managed commands. [21 October advisory](https://docs.gitlab.com/ja-jp/releases/patches/patch-release-gitlab-19-5-1-released/)

CVE-2026-110264 affects CE/EE from 7.0 before 18.11.13; then these branches below their listed patch:

| Branch | Fixed floor |
| --- | --- |
| 18.11 | 18.11.13 |
| 19.0 | 19.0.10 |
| 19.1 | 19.1.9 |
| 19.2 | 19.2.9 |
| 19.3 | 19.3.6 |
| 19.4 | 19.4.3 |
| 19.5 | 19.5.1 |

These are vulnerability boundaries, **not permission to jump directly from an old major version**. The advisory covers all deployment types unless explicitly limited. [Affected intervals](https://docs.gitlab.com/ja-jp/releases/patches/patch-release-gitlab-19-5-1-released/)

## Contain and preserve

If patching cannot start promptly, restrict inbound access at your firewall/load balancer to the smallest necessary trusted population, or withdraw the public route. Plan for Git-over-SSH, webhooks and runners as well as HTTPS. Application maintenance mode is not a security boundary against unauthenticated request processing.

Preserve version/edition, package or image identity, deployment topology, relevant logs and the advisory's detection results. Retain suspicious native-worker crashes or Org-mode render bursts for investigation; no detection match does not establish absence of exploitation. [Vendor detection links](https://docs.gitlab.com/ja-jp/releases/patches/patch-release-gitlab-19-5-1-released/)

## Build the route before installing

1. Enter current and target versions in GitLab's linked Upgrade Path tool. Save every required stop and read its version-specific upgrade notes. Choose the latest patch at each required stop. Check OS, PostgreSQL, storage and optional-feature compatibility. [Upgrade paths](https://docs.gitlab.com/update/upgrade_paths/)
2. Run the documented pre-upgrade checks and confirm there are no pending background migrations. Reserve enough time for migrations between stops; an installer exit is not migration completion. [Preparation](https://docs.gitlab.com/update/plan_your_upgrade/)
3. Take a full, current backup and test restoration on an isolated installation. On Linux package installs, the ordinary backup excludes `/etc/gitlab`, TLS/SSH material and object-storage contents: preserve those separately, including `gitlab-secrets.json`. Store secrets securely rather than in the response log. The automatic upgrade database backup does not replace this. [Backup coverage](https://docs.gitlab.com/administration/backup_restore/backup_gitlab/)
4. Record the rollback backup ID, exact old version/edition, recovery location and expected data-loss window. Restore requires the **same version and CE/EE type** that produced the backup. [Restore prerequisites](https://docs.gitlab.com/administration/backup_restore/restore_gitlab/)

## Execute the matching installation procedure

**Single-node Linux package:** pause CI activity, use maintenance mode where available, follow Runner compatibility guidance and install one approved stop. On Debian/Ubuntu choose exactly one edition below; replace `APPROVED_STOP` with the approved numeric version. These are change commands for a prepared maintenance window, not discovery commands. Run one at a time; stop on any error:

```sh
sudo apt update
sudo apt install 'gitlab-ee=APPROVED_STOP-ee.0'
```

For CE, use `gitlab-ce=APPROVED_STOP-ce.0`. RPM systems require the distribution-specific package suffix in the official instructions. Do not use an unversioned install when intermediate stops are required. [Linux package procedure](https://docs.gitlab.com/update/package/)

**Docker:** follow the [Docker upgrade procedure](https://docs.gitlab.com/update/docker/) with the exact approved image version and persistent configuration/data mounts. **Helm:** follow [chart upgrades](https://docs.gitlab.com/charts/installation/upgrade/) and chart-to-GitLab version mappings. **Multi-node, Geo or source builds:** use their specific linked procedures; single-node package commands are insufficient.

At each stop, wait for background migrations to finish. On Linux package versions **18.9 and later**, the read-only listing is:

```sh
sudo gitlab-rake gitlab:background_migrations:list
```

For 18.5–18.8, use the documented `gitlab:background_migrations:status`; older versions require their documented UI/database checks. Resolve failed, active or paused work before proceeding; do not force-finalize migrations to make the gate look complete. [Version-specific migration checks](https://docs.gitlab.com/update/background_migrations/)

## Verify, recover and finish

Rerun [upgrade health checks](https://docs.gitlab.com/update/plan_your_upgrade/): general configuration, migration status and secret decryption. Verify the installed target, sign-in, repository browsing/clone, a test-project push, a CI job and configured integrations. Resume activity only after these pass.

If a stop fails, retain logs and stop the sequence. Use GitLab's restore/rollback procedure with the matching backup; do not downgrade packages against a migrated database. Keep any restored vulnerable version isolated until patched.

**Output limit:** retain full checks privately, share only version/edition, migration states and redacted errors. Even sanitized output may identify internal services. Passing checks do not clear earlier compromise.

- [ ] Exact affected interval and topology recorded.
- [ ] Required stops and tested recovery backup recorded.
- [ ] Each stop installed; migrations finished before the next.
- [ ] Final fixed version and application checks verified.
- [ ] CI resumed; incident findings and remaining gaps assigned.
