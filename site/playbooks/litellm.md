# LiteLLM: isolate, rebuild cleanly and revoke reachable credentials

Operator playbook · checked 22 October 2026 · incident owner: __________ · asset: __________

## Two-minute applicability check — without Python

**Do not start Python, pip, a notebook, the LiteLLM application or an affected container to inspect it.** Startup hooks can execute before an explicit LiteLLM import. The vendor report contains a `pip show` suggestion but later explicitly warns that running pip retriggers the payload; this playbook follows that warning. [Vendor incident report](https://docs.litellm.ai/blog/security-incident-oct-21-2026)

Use existing build/deployment records from a trusted machine. Look for PyPI **1.107.0 wheels**, or Docker Hub/GHCR artifacts obtained during the 21 October UTC distribution windows: PyPI 11:39:51–13:23; Docker Hub 11:46:56–14:20; GHCR 11:46:56 until unavailable by 13:51. Affected tags included `v1.107.0`, `latest`, `main-latest` and `main-stable`. Cached artifacts can execute later. Private enterprise-registry releases were excluded by the vendor. [Affected artifacts](https://docs.litellm.ai/blog/security-incident-oct-21-2026)

If an affected artifact ran, treat its environment as compromised. If identity or execution history is missing, record **possible exposure** and contain while investigating. A clean source tag does not certify the wheel or image.

## Immediate containment and preservation

1. From a trusted control plane, isolate the host/container from outbound networks and sensitive internal services. Stop automatic redeploys, CI jobs and scheduled starts that could execute it again. Follow your incident-response process for volatile evidence; do not delay urgent isolation for a perfect snapshot.
2. Preserve an offline snapshot or read-only copy, original wheel/image if available, digests, build logs, lockfiles, deployment IDs and execution timestamps. Include relevant cloud/network/authentication logs. Keep originals untouched and access restricted.
3. Do not delete matching files or run a “cleanup” one-liner. The original researcher reports a detached remote-code loader and credential collection beyond the LiteLLM package. Removing startup files alone cannot account for subsequent activity. [Original upstream report](https://github.com/BerriAI/litellm/issues/47826)

## Inspect the copy, then rebuild

**Virtualenv/SDK installation:** use a clean host and trusted non-Python filesystem tools against the offline copy. Inventory `litellm-1.107.0.dist-info`, `cook.pth`, `cook.py` and `sitecustomize.py`, then compare artifact hashes with the original report. A filename such as `sitecustomize.py` can have legitimate uses: inspect its provenance; never execute it. Missing files cannot clear exposure. [Researcher artifact hashes and markers](https://github.com/BerriAI/litellm/issues/47826)

**Container installation:** use retained registry/deployment digests and platform manifests, not today's value of a mutable tag. With a trusted Docker client/daemon and the retained image already present, this displays only digest metadata and does not start the image. Replace the placeholder with its recorded image ID:

```sh
docker image inspect --format '{{json .RepoDigests}}' 'RECORDED_IMAGE_ID'
```

Expected output is a short digest list. An empty list or missing image means identity is unresolved. Do not print full image/container inspection JSON: environment fields can contain credentials. [Docker inspect reference](https://docs.docker.com/reference/cli/docker/image/inspect/)

**Clean rebuild:** provision a new trusted host/build environment when the old host's integrity cannot be established. Rebuild virtualenvs or images from reviewed source/configuration, excluding old site-packages, caches and executable volumes. Re-fetch dependencies from verified origins. The incident response recommended 1.106.2; recheck current vendor guidance before selecting a release and record its immutable digest/hash. Do not copy the compromised filesystem into a fresh container and call it clean. [Original JFrog research and remediation](https://research.jfrog.com/post/litellm-hijacked-again/)

## Revoke what the environment could reach

From a separate trusted device, list credential **identifiers and owners**, never values: upstream model-provider keys in the proxy database, LiteLLM master/virtual keys, database password, cloud roles/keys, repository/package tokens, CI secrets, Kubernetes credentials and readable host credentials. Coordinate issuer revocation before giving replacements to the clean environment. Use the [Railway credential playbook](railway.md) for issuer-specific examples; its revocation mechanics also apply outside Railway.

For AWS role credentials, remove the compromised workload's ability to obtain fresh sessions, then use IAM **Roles → affected role → Revoke sessions**. This affects every current user of that role; service-linked roles and IAM Identity Center need their separate documented paths. Revocation of older sessions does not prevent future role assumption. Review CloudTrail for unexpected activity. [AWS role revocation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_revoke-sessions.html)

## Verify, escalate and finish

Before traffic returns, confirm the new deployment's artifact and build origin, replacement credentials and issuer revocation receipts. Test gateway authentication, one harmless model request with a restricted test key, database access and your spending/rate limits. Review access logs and billing for unexplained use. If validation fails, keep traffic off and diagnose the failure in the clean environment. Never roll back to the affected environment; keep it isolated for investigation.

Escalate unexplained outbound activity, privileged host access, unknown reachable credentials or cloud changes to a qualified incident responder. This playbook cannot establish what was stolen or every persistence mechanism.

**Output limit:** share only asset IDs, hashes, timestamps, matching filenames and redacted errors. Keep snapshots, package contents, request bodies and raw logs private.

- [ ] Execution stopped and environment isolated.
- [ ] Evidence preserved without starting its interpreter.
- [ ] Clean replacement built and deployed with recorded artifact identity.
- [ ] Reachable credentials revoked at their issuers; consumers updated.
- [ ] Functional checks pass; misuse investigation and unknowns assigned.
