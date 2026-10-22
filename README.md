# After the alert

Free incident-response playbooks, browser tools and read-only scripts. No signup, paywall or wallet connection.

[Website](https://after-the-alert.pages.dev/) · [File inventory](FILES.md) · [Download the response kit](https://after-the-alert.pages.dev/downloads/incident-response-kit.zip)

The site covers thirteen topics: eleven operational playbooks and two evidence notes. Browser tools compare supplied PHP, GitLab, Node.js and Plex versions, record LiteLLM evidence, and build a credential-rotation handoff. Input stays in the browser tab unless you export it. Nothing persists after a reload.

This is a **22 October 2026 snapshot**, not a live advisory feed. Read the current vendor notice before acting. A version match or an empty inspection result does not establish that a system is clean.

## Build and test

Requires Node.js and Bash for the tests. No application packages need installing. Packaging uses `/usr/bin/zip`.

```sh
node scripts/build-site.mjs
node --test tests/*.test.mjs
node scripts/package.mjs
```

Serve `site/` through a static HTTP server to use the browser modules. Edit `site/playbooks/*.md` and `site/incidents.json` for content, `FILES.md` for the file inventory, and `scripts/build-site.mjs` for generated page templates. `site/manual.html` is maintained separately. Rebuild and package after edits.

## Deploy

Only `site/` is uploaded to Cloudflare Pages. With an existing authenticated Wrangler installation:

```sh
wrangler pages deploy site --project-name after-the-alert --branch main
```

Keep hosting credentials and completed incident records outside this repository.

## Reuse and donations

Original guides and scripts are free to use and redistribute. Third-party source materials retain their owners' rights. No vendor endorsement is implied.

Optional donations: native USDC on **Base**.

`0x356a4E9BFAC16828103FDE83407dCe4e5ea947f5`

Donations unlock nothing and do not purchase incident-response support.
