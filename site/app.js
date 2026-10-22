import { matchVersion, assessLiteLLM, rotationStatus, makeHandoff } from './triage-core.mjs';

const byId=id=>document.getElementById(id);
const node=(tag,text,className)=>{const element=document.createElement(tag);if(text!==undefined)element.textContent=text;if(className)element.className=className;return element;};
async function copy(text,status,fallback) {
  try {
    if(!navigator.clipboard||!window.isSecureContext)throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    status.textContent='Copied. Nothing was sent or executed.';
  } catch {
    if(fallback){fallback.focus();fallback.select();}
    status.textContent=fallback?'Automatic copy is unavailable. The text is selected; copy it manually.':'Automatic copy is unavailable. Select the text below and copy it manually.';
  }
}

const search=byId('incident-search');
if(search) {
  byId('search-controls').hidden=false;
  const rows=[...document.querySelectorAll('.incident-row')];
  const buttons=[...document.querySelectorAll('[data-filter]')];
  const clear=byId('clear-filters');
  let category='all';
  const update=()=>{
    const terms=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count=0;
    for(const row of rows){row.hidden=!(category==='all'||row.dataset.category===category)||!terms.every(term=>row.dataset.search.includes(term));if(!row.hidden)count++;}
    for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.filter===category));
    byId('filter-status').textContent=`${count} of ${rows.length} topics`;
    byId('no-results').hidden=count!==0;
    if(clear)clear.hidden=category==='all'&&!search.value.trim();
  };
  search.addEventListener('input',update);
  for(const button of buttons)button.addEventListener('click',()=>{category=button.dataset.filter;update();});
  if(clear)clear.addEventListener('click',()=>{search.value='';category='all';update();search.focus();});
  update();
}

const address=byId('wallet-address');
if(address) {
  const config=window.AFTER_THE_ALERT_CONFIG;
  const valid=config&&/^0x[a-fA-F0-9]{40}$/.test(config.walletAddress)&&!/^0x0{40}$/i.test(config.walletAddress);
  if(valid){address.value=config.walletAddress;byId('copy-wallet').disabled=false;byId('copy-wallet').addEventListener('click',()=>copy(address.value,byId('wallet-copy-status'),address));}
  else byId('wallet-copy-status').textContent='Address configuration could not be verified. Do not send funds from this view.';
}

for(const button of document.querySelectorAll('.copy-code')) {
  button.hidden=false;
  button.addEventListener('click',()=>copy(button.parentElement.querySelector('code').textContent,button.parentElement.querySelector('.copy-status')));
}
for(const button of document.querySelectorAll('[data-print]')){button.hidden=false;button.addEventListener('click',()=>window.print());}

const assets=[];
const rotations=[];
let nextId=1;
function refreshHandoff() {
  if(!byId('handoff-preview'))return;
  byId('handoff-preview').value=makeHandoff({assets,rotations});
  const list=byId('workspace-list');list.replaceChildren();
  if(!assets.length)list.append(node('p','No checks added yet. Use “Add to response notes” on a result.','empty-state'));
  for(const asset of assets) {
    const item=node('article',undefined,'workspace-item');
    const description=node('div');description.append(node('strong',asset.alias),node('p',`${asset.product} ${asset.version||'unknown'} — ${asset.result.heading}`));
    const remove=node('button','Remove','text-button');remove.type='button';remove.setAttribute('aria-label',`Remove ${asset.alias} from response notes`);
    remove.addEventListener('click',()=>{assets.splice(assets.findIndex(x=>x.id===asset.id),1);refreshHandoff();});
    item.append(description,remove);list.append(item);
  }
}
function showResult(container,result,alias) {
  container.className=`result-panel ${result.status}`;container.replaceChildren();
  container.append(node('h3',result.heading,'result-heading'),node('p',result.status==='action'?'Action needed':result.status==='floor'?'Version floor met':result.status==='invalid'?'Input needed':'Evidence needed','result-label'),node('p',result.summary));
  if(result.observation)container.append(node('p',result.observation,'next-action'));
  if(result.fixedVersion)container.append(node('p',`Published fix floor: ${result.fixedVersion}`,'next-action'));
  if(result.steps.length){const list=node('ol',undefined,'result-steps');for(const step of result.steps)list.append(node('li',step));container.append(list);}
  if(result.status!=='invalid') {
    const links=node('p',undefined,'row-links');
    const guide=node('a','Open the recovery playbook');guide.href=result.guide;
    const source=node('a','Original advisory');source.href=result.source;
    links.append(guide,source);container.append(links,node('p',result.limits,'field-help'));
    const add=node('button','Add to response notes','button secondary');add.type='button';
    add.addEventListener('click',()=>{assets.push({id:nextId++,alias:alias||`${result.product} asset ${assets.length+1}`,product:result.product,version:result.version,result});add.disabled=true;add.textContent='Added to response notes';refreshHandoff();});
    container.append(add);
  }
}

if(byId('version-form')) {
  byId('version-form').addEventListener('submit',event=>{
    event.preventDefault();
    showResult(byId('version-result'),matchVersion(byId('product').value,byId('version').value.trim()),byId('asset-alias').value.trim());
  });
  byId('product').addEventListener('change',()=>{
    const product=byId('product').value;
    byId('version').placeholder={php:'8.3.35',gitlab:'19.5.0',node:'24.22.0',plex:'1.43.3.10860'}[product];
    byId('version-help').textContent=product==='plex'?'Use four numeric parts. An optional Plex build hash is accepted.':'Use three numeric parts, without a v prefix. Distro suffixes and backports need the distributor advisory.';
    const result=byId('version-result');result.className='result-panel';result.replaceChildren();
    result.append(node('h3',`Check your ${byId('product').selectedOptions[0].textContent} version`),node('p','Enter the version you found in your deployment, then choose “Compare version”.'));
  });
  const requestedProduct=new URLSearchParams(window.location.search).get('product');
  if([...byId('product').options].some(option=>option.value===requestedProduct))byId('product').value=requestedProduct;
  byId('product').dispatchEvent(new Event('change'));
  byId('litellm-form').addEventListener('submit',event=>{
    event.preventDefault();
    showResult(byId('litellm-result'),assessLiteLLM({evidence:byId('litellm-evidence').value,version:byId('litellm-version').value.trim()}),byId('litellm-alias').value.trim());
  });
  byId('rotation-form').addEventListener('submit',event=>{
    event.preventDefault();
    const alias=byId('key-alias').value.trim(),provider=byId('key-provider').value.trim();
    if(!alias||!provider)return;
    rotations.push({id:nextId++,alias,provider,dependents:byId('key-dependents').value.trim(),issued:false,updated:false,revoked:false,verified:false});
    byId('rotation-form').reset();renderRotations();refreshHandoff();
  });
  byId('download-handoff').addEventListener('click',()=>{
    const blob=new Blob([byId('handoff-preview').value],{type:'text/markdown;charset=utf-8'});
    const url=URL.createObjectURL(blob);const link=node('a');link.href=url;link.download='incident-handoff.md';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    byId('handoff-status').textContent='Download prepared. Check your browser’s downloads; keep the record private.';
  });
  byId('copy-handoff').addEventListener('click',()=>copy(byId('handoff-preview').value,byId('handoff-status'),byId('handoff-preview')));
  refreshHandoff();
}

function renderRotations() {
  const list=byId('rotation-list');list.replaceChildren();
  if(!rotations.length)list.append(node('p','No credentials recorded. Add one alias to start.','empty-state'));
  for(const row of rotations) {
    const article=node('article',undefined,'rotation-row');
    const heading=node('div',undefined,'rotation-heading');const info=node('div');
    info.append(node('h3',row.alias),node('p',`${row.provider}${row.dependents?' · '+row.dependents:''}`));
    const status=node('span',rotationStatus(row)==='recorded'?'All steps marked':'Open','badge');
    const remove=node('button','Remove','text-button');remove.type='button';remove.setAttribute('aria-label',`Remove credential ${row.alias}`);
    remove.addEventListener('click',()=>{rotations.splice(rotations.findIndex(x=>x.id===row.id),1);renderRotations();refreshHandoff();});
    heading.append(info,status,remove);article.append(heading);
    const checks=node('div',undefined,'rotation-checks');
    for(const [key,label] of [['issued','Replacement issued'],['updated','Dependents updated'],['revoked','Old credential revoked at issuer'],['verified','Replacement works; receipt retained']]) {
      const wrapper=node('label');const input=node('input');input.type='checkbox';input.checked=row[key];input.setAttribute('aria-label',`${row.alias}: ${label}`);
      input.addEventListener('change',()=>{row[key]=input.checked;status.textContent=rotationStatus(row)==='recorded'?'All steps marked':'Open';refreshHandoff();});
      wrapper.append(input,node('span',label));checks.append(wrapper);
    }
    article.append(checks);list.append(article);
  }
}
