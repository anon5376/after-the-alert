# Zeabur: restore elsewhere, rehearse, then move traffic

Operator playbook · checked 22 October 2026 · migration owner: __________ · expiry: __________

## Two-minute applicability and containment check

Record each service's actual expiry. From **1 December 2026**, dedicated servers stop renewing and shut down at individual expiry; shared-cluster services pause, with manual restart for backup. **31 December** is the final shutdown, not a promise that your service lasts until then. Export/deletion/support deadlines remained unfinalized in the [founder's notice](https://zeabur.com/blogs/zeabur-is-shutting-down).

If compromise is suspected, isolate the service and preserve incident evidence before treating its files as migration inputs. A migration does not remove malicious database objects or revoke exposed credentials. Use fresh destination secrets and separately revoke the old ones at their issuers.

## Inventory and choose the destination

Record source repository/commit or image, start/build command, database engine/version/extensions, persistent volumes/uploads, background workers, schedules, queues, network routes, environment-variable **names**, domains/DNS and external integrations. Keep private configuration exports separately. Include registrar/domain transfer in the plan; moving an application does not move its domain registration. [Zeabur migration guide](https://zeabur.com/blogs/migrate-from-zeabur), [domain arrangements](https://zeabur.com/blogs/zeabur-is-shutting-down)

Choose your destination before exporting: confirm matching database extensions, storage capacity, backup/restore tools, private connectivity, TLS, worker support and cost. Use its official provisioning/restore guide and create an isolated rehearsal environment. Do not open production traffic or enable outbound jobs there yet. The steps below describe a **PostgreSQL logical migration**; MySQL, MongoDB, Redis and filesystem volumes require their own native format and restore procedure.

## Export beyond Zeabur's retention window

Zeabur's backup interface supports online database exports; PostgreSQL exports are SQL files. For other volume-backed services, its documented offline flow is **Settings → Suspend Service → Backup → download → restart**. These volume backups exclude files outside mounted volumes, including application source. Download copies to private storage outside Zeabur; the backup documentation specifies seven-day retention. Confirm the live interface still offers these features. [Zeabur backup documentation](https://zeabur.com/docs/en-US/deploy/backup)

Record backup start/end times, source identity, file size and checksum, tool version, warnings and exit status. Export all databases and file stores the application needs. PostgreSQL `pg_dump` covers one database, not cluster roles/tablespaces; identify those separately. Use a client version compatible with the source and destination: `pg_dump` refuses a source newer than its own major version. [PostgreSQL export reference](https://www.postgresql.org/docs/current/app-pgdump.html)

## PostgreSQL rehearsal: no passwords in commands

On a trusted migration machine, configure two [connection-service entries](https://www.postgresql.org/docs/18/libpq-pgservice.html), `SOURCE_DB` and `DEST_EMPTY`, with verified host, port, database, user and provider-required TLS settings. `DEST_EMPTY` must point to a newly created empty rehearsal database, using a restore role. Use a password prompt or a private [password file](https://www.postgresql.org/docs/current/libpq-pgpass.html); on Unix it must deny group/world access. These names are placeholders, not ready-made connections.

In a new private working directory, using a new filename for each attempt, run one command at a time and stop on error:

```sh
pg_dump --dbname='service=SOURCE_DB' --format=custom --file=database.dump
```

Stop on export failure. After a successful export, inspect the new archive:

```sh
pg_restore --list database.dump > database-contents.txt
```

Stop on any error and review warnings. The listing establishes readable archive structure only. A dump can contain executable database logic; if source integrity is uncertain, have it reviewed before restoration. Never send the archive to an online checker. [Export behavior and trust warning](https://www.postgresql.org/docs/current/app-pgdump.html)

After destination extensions and the permissions plan are prepared, restore the reviewed custom-format archive:

```sh
pg_restore --dbname='service=DEST_EMPTY' --single-transaction --no-owner --no-acl database.dump
```

This rolls back on a restore error. It intentionally omits original ownership/grants: recreate appropriate application roles and privileges before testing. Do not run the application as the restore administrator. For large databases, single-transaction limits may require a DBA-designed alternative. No `--clean` or database-dropping command is needed. [Restore options](https://www.postgresql.org/docs/current/app-pgrestore.html)

**Downloaded `.sql` branch:** a Zeabur SQL export uses `psql`, not `pg_restore`. Review it first, then use a fresh empty target:

```sh
psql -X --dbname='service=DEST_EMPTY' --set=ON_ERROR_STOP=on --file=zeabur-backup.sql
```

A failure can leave partial objects; retain the failure and use another empty rehearsal database for the next attempt. [psql reference](https://www.postgresql.org/docs/18/app-psql.html)

## Validate, cut over and retain recovery options

Compare representative record counts, newest records, attachments and business totals against the same backup point. Deploy the application against restored data; test login, reads, a reversible test write and background processing without sending real notifications/payments. Record duration to establish a realistic outage window.

Schedule cutover: stop source writes and workers, take the final consistent export/files copy, restore to an empty production destination, repeat checks, then update application connections and DNS. Verify TLS, callbacks and representative requests through the public domain. Start destination workers once; keep source workers stopped to prevent duplicate jobs. Preserve the old system privately.

If verification fails **before destination writes**, return traffic to the retained source only if it is safe and still available. Once new writes occur, freeze writes and reconcile data before reversing traffic; blindly switching DNS loses/diverges data. Escalate missing exports, restore errors or expiry conflicts immediately.

**Output limit:** retain archives and full logs privately; share counts, checksums, timestamps and redacted errors only. A checksum does not prove completeness.

- [ ] Deadline, destination and every stateful dependency recorded.
- [ ] Off-platform backups downloaded and restore rehearsed.
- [ ] Roles, data comparisons and application checks pass.
- [ ] Final write freeze/export/cutover verified; one worker set active.
- [ ] New backups tested; rollback/data reconciliation owner assigned.
