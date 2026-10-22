export const SNAPSHOT = '2026-10-22';
const sources = {
  php: 'https://www.php.net/archive/2026.php#2026-10-21-5',
  gitlab: 'https://docs.gitlab.com/ja-jp/releases/patches/patch-release-gitlab-19-5-1-released/',
  node: 'https://nodejs.org/en/blog/vulnerability/october-2026-security-releases',
  plex: 'https://forums.plex.tv/t/important-security-update-for-plex-media-server-v1-43-2-and-earlier/942319/3',
  litellm: 'https://docs.litellm.ai/blog/security-incident-oct-21-2026',
};
const commonLimits = 'This compares a supplied version with a dated vendor notice. It does not identify your running build or rule out earlier compromise. Verify distribution backports and the current vendor guidance.';
const compare = (left, right) => {
  for (let i=0;i<Math.max(left.length,right.length);i++) {
    const difference=(left[i]??0)-(right[i]??0);
    if(difference)return Math.sign(difference);
  }
  return 0;
};

export function matchVersion(product, version) {
  const base={product,version,asOf:SNAPSHOT,source:sources[product]||'',guide:`/guides/${product}.html`,limits:commonLimits};
  const pattern=product==='plex'
    ? /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[a-fA-F0-9]+)?$/
    : /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
  const parsed=typeof version==='string'&&version.length<100?pattern.exec(version):null;
  if(!['php','gitlab','node','plex'].includes(product)||!parsed||parsed[0]!==version||!parsed.slice(1).every(x=>Number.isSafeInteger(Number(x)))) {
    return {...base,status:'invalid',heading:'Enter the complete upstream version',summary:product==='plex'?'Use four numbers, for example 1.43.3.10861. An optional Plex build hash is accepted.':'Use three numbers, for example 8.3.35. For distro versions with suffixes, look up the distributor advisory first.',steps:[]};
  }
  const parts=parsed.slice(1).map(Number);
  const [major,minor]=parts;
  let floor;
  if(product==='php'&&major===8&&[2,3,4,5].includes(minor))floor=[8,minor,{2:35,3:36,4:27,5:12}[minor]];
  if(product==='gitlab') {
    if(major>=7&&(major<18||(major===18&&minor<=11)))floor=[18,11,13];
    if(major===19&&minor<=5)floor=[19,minor,[10,9,9,6,3,1][minor]];
  }
  if(product==='node')floor={22:[22,23,4],24:[24,22,1],26:[26,12,1]}[major];
  if(product==='plex'&&major===1)floor=[1,43,3,10861];
  if(!floor) {
    return {...base,status:'review',heading:'This branch needs a separate check',summary:'No supported version-only conclusion is available from this table. Legacy builds may need migration or vendor backport evidence; future branches need their own current notice.',steps:['Record the exact product, branch, package source and runtime evidence.','Check the current vendor release policy and advisory. Do not treat an unlisted branch as unaffected.']};
  }
  const affected=compare(parts,floor)<0;
  const result={...base,status:affected?'action':'floor',fixedVersion:floor.join('.'),heading:affected?'Below the published fix floor':'Meets this advisory’s version floor',summary:affected?`The supplied version is below ${floor.join('.')}. Confirm the installed build and follow the matching recovery playbook.`:`The supplied version is at or above ${floor.join('.')} for this branch. This answers the version question only.`,steps:[]};
  if(product==='php')result.steps=['Confirm the build serving web requests, including replicas; a local CLI version may differ.','Check the distributor advisory if the package carries a backport.','Update through the host or package vendor, reload the serving workers, then verify production behavior.'];
  if(product==='gitlab')result.steps=['Identify self-managed CE/EE versus a managed service.','Use GitLab’s required upgrade stops and migrations; this floor is not permission to jump versions.','Retain backup/restore evidence, verify the running build and check background migrations after the upgrade.'];
  if(product==='node')result.steps=['Inventory deployed runtimes, container base images, build jobs and bundled runtimes.','Move each affected supported line to its security release; rebuild and redeploy artifacts that embed the old runtime.','Verify each running process/container and exercise the application’s TLS and compressed-response paths.'];
  if(product==='plex')result.steps=['Check Plex Web → Settings → General for the running server version.','If an older server was internet-reachable, Plex says to assume it may be compromised; patching alone is insufficient.','Follow the vendor’s clean-rebuild/account recovery advice when compromise cannot be ruled out; review the service account’s reachable shares and credentials.'];
  return result;
}

export function assessLiteLLM({evidence='unknown',version=''}={}) {
  if(!['unknown','declared','installed','executed'].includes(evidence))evidence='unknown';
  const installed=['installed','executed'].includes(evidence);
  const affected=version==='1.107.0';
  const action=installed&&affected;
  return {
    product:'litellm',version,evidence,observation:{unknown:'History unknown; the source of the entered version is not established.',declared:'Dependency declaration observed; installation and execution are not established.',installed:'Artifact installation observed; payload execution is not established.',executed:'Artifact execution observed, according to the operator.'}[evidence],asOf:SNAPSHOT,source:sources.litellm,guide:'/guides/litellm.html',
    status:action?'action':'review',
    heading:action?'Treat the affected environment as compromised':'Deployment history still needs checking',
    summary:action?'Your observation matches the vendor’s affected public release. Follow its incident procedure from a trusted environment. This is a response assumption, not independent forensic verification.':affected&&evidence==='declared'?'A dependency declaration names 1.107.0. Establish whether that artifact was installed or executed. A manifest alone cannot settle exposure.':affected?'Version 1.107.0 was entered, but the evidence source is unknown. Establish what that version came from and whether the affected artifact was installed or executed.':'A different current version or an unknown version cannot rule out an earlier affected artifact. Compare retained installation, image-digest and execution records with the vendor report.',
    steps:['Do not start Python or pip in the potentially affected environment.','Preserve deployment logs and artifact identifiers; use the offline metadata and dependency-file tools from a trusted environment.','If affected, follow the vendor’s clean rebuild and credential revocation procedure, including credentials the process could reach.','Verify the replacement artifact and provider-side revocation separately; missing local markers do not clear historical exposure.'],
    limits:'This tool uses your selected observation only. It does not inspect an environment. A source tag, a current pin, or the absence of markers cannot establish a clean history.',
  };
}

export function rotationStatus(row) {
  return ['issued','updated','revoked','verified'].every(key=>row[key]===true)?'recorded':'open';
}

const line = value => String(value??'').replace(/[\r\n\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,' ').replace(/[<>]/g,'').slice(0,500);
export function makeHandoff({assets=[],rotations=[]}={}) {
  const output=['# Incident handoff',`Advisory snapshot: ${SNAPSHOT}`,'','These are operator-supplied observations and checklist entries. They do not establish a clean host or rule out compromise. No server was scanned by this website.',''];
  for(const asset of assets) {
    const result=asset.result;
    output.push(`## ${line(asset.alias)||'Unnamed asset'}`,`Product: ${line(asset.product)} | supplied version: ${line(asset.version)||'unknown'}`,`Observation: ${result.observation||'Operator-supplied runtime version; not independently verified.'}`,`Outcome: ${result.heading}`,result.summary,`Source: ${result.source}`,'',...result.steps.map(step=>`- [ ] ${step}`),`Limits: ${result.limits}`,'Owner: [assign]','Observation time: [record]','Evidence location: [record privately]','');
  }
  if(rotations.length)output.push('## Credential rotation register','Only key aliases belong here; never secret values. For suspected active misuse, prioritize issuer-side revocation and containment. Otherwise coordinate replacement, dependent updates, verification and revocation.','');
  for(const row of rotations) {
    output.push(`### ${line(row.alias)||'Unnamed credential'} — ${rotationStatus(row)==='recorded'?'ALL STEPS RECORDED':'OPEN'}`,`Issuer: ${line(row.provider)} | dependents: ${line(row.dependents)}`,...[['issued','Replacement issued'],['updated','Dependent configuration updated'],['revoked','Old credential revoked at issuer'],['verified','Replacement works; receipt retained']].map(([key,label])=>`- [${row[key]?'x':' '}] ${label}`),'Owner: [assign]','Revocation receipt: [record privately]','');
  }
  output.push('## Handoff','- [ ] Technical owner reviewed the evidence.','- [ ] Unresolved exposure questions have an owner and next check.','- [ ] Current vendor notices were rechecked.');
  return output.join('\n');
}
