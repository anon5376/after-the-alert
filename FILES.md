# Website files

The website is plain HTML, CSS and JavaScript. There is no backend, database, account system, payment processor or application dependency. Everything under `site/` is deployed as static content, except `_headers`, which configures hosting headers.

[Browse the public repository](https://github.com/anon5376/after-the-alert) · [Download the website source](https://after-the-alert.pages.dev/downloads/site-source.zip)

Looking for a script to use? The [script downloads](https://after-the-alert.pages.dev/#scripts) show each filename, required runtime and how to run it.

## Pages

| File under site/ | Purpose |
| --- | --- |
| `index.html` | Searchable incident library, downloads and optional donations. |
| `tools.html` | Version checks, LiteLLM evidence, credential register and Markdown export. |
| `sources.html` | Original-source links, corrections and evidence limits. |
| `files.html` | This file inventory. |
| `manual.html` | General incident-response manual. |
| `guides/*.html` | Thirteen individual guides and evidence notes. |

Guide filenames: `php.html`, `gitlab.html`, `litellm.html`, `railway.html`, `zeabur.html`, `node.html`, `plex.html`, `emudhra.html`, `tidb.html`, `tor.html`, `safepay.html`, `japan.html`, `sbi.html`. The Japan and SBI pages are evidence notes. Each has a corresponding Markdown file under `site/playbooks/`.

## Browser code and styles

| File under site/ | Purpose |
| --- | --- |
| `app.js` | Search/filter reset, product selection from guide links, copy buttons, forms, credential rows, printing and local Markdown export. |
| `triage-core.mjs` | Version comparison, LiteLLM evidence classification, credential status and handoff formatting. |
| `config.js` | Public donation address and network configuration. No secret keys. |
| `styles.css` | Styles for the homepage, tools, sources, inventory and guides. |
| `manual.css` | Styles for the general manual. |

The browser tools make no network requests and use no persistent storage. Hosting receives ordinary page requests. There are no analytics or wallet-connection scripts.

## Downloadable scripts

| File under site/downloads/ | What it does |
| --- | --- |
| `check-php-version.mjs` | Node.js command-line tool comparing a supplied PHP version with the snapshot's fix floors. Does not scan a server or run PHP. |
| `inspect-dependency-files.mjs` | Node.js tool reading selected requirements, lockfiles, Dockerfiles and Compose files for LiteLLM declarations. Does not import projects, run Python or use the network. |
| `inspect-litellm-metadata.sh` | Bash tool checking immediate entry names in a supplied offline site-packages directory. Does not read file contents or start Python/pip; rejects symlink paths. |

All three are read-only checks. Read their source and help before running them. A declaration, an installed artifact and execution evidence are different findings; none of these scripts certifies a system as safe.

## Other downloads

| File under site/downloads/ | Purpose |
| --- | --- |
| `asset-inventory.csv` | Blank asset and observation register. |
| `credential-rotation.csv` | Blank credential-alias, revocation and verification register. |
| `migration-acceptance.csv` | Blank restore, cutover and acceptance checklist. |
| `response-checklist.txt` | Plain-text response record template. |
| `source-register.json` | Dated source links and topic metadata. |
| `incident-response-kit.zip` | All thirteen Markdown guides, three scripts, templates and source register. |
| `site-source.zip` | Website, build scripts, tests and documentation; nested ZIPs omitted to avoid recursive copies. |

## Content and hosting files

| File under site/ | Purpose |
| --- | --- |
| `playbooks/*.md` | Thirteen editable guide sources, also available as downloads. |
| `incidents.json` | Topic titles, summaries, categories, tags and original-source URLs. |
| `_headers` | Cloudflare security, caching and download headers. |
| `robots.txt` | Crawler directions and sitemap location. |
| `sitemap.xml` | Public page URLs. |
| `favicon.svg` | Browser-tab icon. |
| `assets/inter-latin.woff2` | Self-hosted Inter variable font. |
| `assets/OFL-Inter.txt` | The font's open-source license. |

## Build scripts, tests and repository files

These files are in the repository and source ZIP. They do not run on the hosting server.

| File | Purpose |
| --- | --- |
| `scripts/build-site.mjs` | Generates homepage, tools, sources, inventory, thirteen guide pages, source JSON and sitemap. |
| `scripts/package.mjs` | Creates both downloadable ZIP files using Node.js and the system zip command. |
| `tests/free-tools.test.mjs` | Six tests for PHP comparison and metadata inspection. |
| `tests/dependency-files.test.mjs` | Eight tests for declaration parsing, input rejection and output privacy. |
| `tests/triage-core.test.mjs` | Six tests for version/evidence results, credential state and handoff exports. |
| `README.md` | Project overview, build, test, deploy and reuse instructions. |
| `DESIGN.md` | Design tokens, components and responsive layout reference. |
| `FILES.md` | Source for this inventory page. |
| `.gitignore` | Excludes local notes, credentials, caches and generated logs from Git. |
