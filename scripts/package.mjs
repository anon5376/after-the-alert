import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const workspace=process.cwd();
const staging=fs.mkdtempSync(path.join(os.tmpdir(),'after-alert-package-'));
const kit=path.join(staging,'incident-response-kit');
const source=path.join(staging,'after-the-alert-source');
fs.mkdirSync(kit);
fs.mkdirSync(source);
const downloads=path.join(workspace,'site/downloads');
fs.cpSync('site/playbooks',path.join(kit,'playbooks'),{recursive:true});
for(const name of fs.readdirSync(path.join(kit,'playbooks'))) {
  const file=path.join(kit,'playbooks',name);
  let text=fs.readFileSync(file,'utf8');
  text=text.replace(/\]\(\/downloads\/(asset-inventory\.csv|credential-rotation\.csv|migration-acceptance\.csv|response-checklist\.txt)\)/g,'](../templates/$1)');
  text=text.replace(/\]\(\/downloads\/(check-php-version\.mjs|inspect-litellm-metadata\.sh|inspect-dependency-files\.mjs)\)/g,'](../tools/$1)');
  text=text.replace(/\]\(\/guides\/([a-z0-9-]+)\.html\)/g,']($1.md)');
  text=text.replace(/\]\(\/(?!\/)([^)]+)\)/g,'](https://after-the-alert.pages.dev/$1)');
  fs.writeFileSync(file,text);
}
fs.mkdirSync(path.join(kit,'tools'));
fs.mkdirSync(path.join(kit,'templates'));
for(const name of ['check-php-version.mjs','inspect-litellm-metadata.sh','inspect-dependency-files.mjs'])fs.copyFileSync(path.join(downloads,name),path.join(kit,'tools',name));
for(const name of ['asset-inventory.csv','credential-rotation.csv','migration-acceptance.csv','response-checklist.txt'])fs.copyFileSync(path.join(downloads,name),path.join(kit,'templates',name));
fs.copyFileSync(path.join(downloads,'source-register.json'),path.join(kit,'source-register.json'));
fs.writeFileSync(path.join(kit,'README.txt'),`AFTER THE ALERT — FREE INCIDENT RESPONSE KIT
Snapshot: 22 October 2026
Website: https://after-the-alert.pages.dev/

START HERE
1. Open the matching Markdown playbook in playbooks/. It contains applicability,
   immediate actions, recovery steps, verification and original-source links.
2. Recheck the current vendor notice. These files are a dated snapshot.
3. Assign the technical owner. Preserve evidence while coordinating containment.
4. Use templates/ to record assets, credential aliases and migration acceptance.
   Keep completed records private. Never put secret values in a worksheet.
5. Read a script before running it. Use a trusted environment and an offline,
   read-only copy of suspect files. No script in this kit patches a system.

TOOLS (run from the kit's root directory)
node tools/check-php-version.mjs 8.3.35
node tools/inspect-dependency-files.mjs --json -- /path/to/requirements.txt
bash tools/inspect-litellm-metadata.sh /physical/path/to/site-packages

Node.js tools use only the standard library; Bash tool uses builtins. No packages
need installing. Do not invoke Python or pip in a potentially affected LiteLLM
environment. Dependency declarations are not installation/execution evidence.
The metadata tool checks immediate entries, rejects symlink paths and reads no
file contents. The dependency parser is conservative, not a complete TOML/YAML
parser. UNKNOWN is unresolved, never clearance. Read each tool's --help.

Exit 0 means a check/processing step completed, not that a host is safe.
Exit 2 indicates invalid, rejected or unassessed input. Preserve the output.

REUSE
Original guides and scripts are free to use and redistribute. Third-party source
materials retain their owners' rights. No vendor endorsement is implied.
Optional donations: native USDC on Base only.
0x356a4E9BFAC16828103FDE83407dCe4e5ea947f5
Donations unlock nothing and do not buy incident-response support.
`);
fs.cpSync('site',path.join(source,'site'),{recursive:true,filter:filename=>!filename.endsWith('.zip')});
fs.cpSync('scripts',path.join(source,'scripts'),{recursive:true});
fs.cpSync('tests',path.join(source,'tests'),{recursive:true});
for(const name of ['README.md','FILES.md','DESIGN.md','.gitignore'])fs.copyFileSync(name,path.join(source,name));
fs.writeFileSync(path.join(source,'README.txt'),`AFTER THE ALERT — WEBSITE SOURCE
Static HTML/CSS/JS. No application dependencies.
Run tests: node --test tests/*.test.mjs
Rebuild pages: node scripts/build-site.mjs
Package downloads (macOS zip path): node scripts/package.mjs
Serve site/ with a static HTTP server to use the browser modules.
All user-entered tool data stays in the browser tab unless the user exports it.
Only publish site/. Keep credentials outside this tree.
Original code and guides are free to use and redistribute. Third-party source
materials retain their owners' rights. IBM Plex Sans is distributed under the SIL Open Font License in
site/assets/OFL-IBM-Plex-Sans.txt.
ZIP downloads are omitted from this source archive to avoid recursive copies.
`);
for(const [folder,name] of [[kit,'incident-response-kit.zip'],[source,'site-source.zip']]) {
  const temporary=path.join(staging,name);
  const result=spawnSync('/usr/bin/zip',['-qr',temporary,path.basename(folder)],{cwd:staging,encoding:'utf8'});
  if(result.status!==0)throw new Error(`ZIP failed: ${result.stderr}`);
  fs.copyFileSync(temporary,path.join(downloads,name));
  console.log(`${name}: ${fs.statSync(temporary).size} bytes`);
}
fs.rmSync(staging,{recursive:true});
