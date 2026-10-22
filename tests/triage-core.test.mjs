import test from 'node:test';
import assert from 'node:assert/strict';
import { matchVersion, assessLiteLLM, rotationStatus, makeHandoff } from '../site/triage-core.mjs';

test('published PHP, GitLab, Node and Plex boundaries produce the correct next action', () => {
  for (const [product, before, fixed] of [
    ['php','8.2.34','8.2.35'], ['php','8.3.35','8.3.36'],
    ['php','8.4.26','8.4.27'], ['php','8.5.11','8.5.12'],
    ['gitlab','18.11.12','18.11.13'], ['gitlab','19.0.9','19.0.10'],
    ['gitlab','19.1.8','19.1.9'], ['gitlab','19.2.8','19.2.9'],
    ['gitlab','19.3.5','19.3.6'], ['gitlab','19.4.2','19.4.3'],
    ['gitlab','19.5.0','19.5.1'], ['node','22.23.3','22.23.4'],
    ['node','24.22.0','24.22.1'], ['node','26.12.0','26.12.1'],
    ['plex','1.43.3.10860','1.43.3.10861'],
  ]) {
    assert.equal(matchVersion(product,before).status,'action',`${product} ${before}`);
    assert.equal(matchVersion(product,fixed).status,'floor',`${product} ${fixed}`);
    assert.equal(matchVersion(product,before).fixedVersion,fixed);
    assert.ok(matchVersion(product,fixed).limits.includes('compromise'));
  }
});

test('unknown, future, vendor-backported and malformed releases cannot receive clearance', () => {
  for(const [product,version] of [['php','8.1.33'],['php','8.6.0'],['gitlab','19.6.0'],['gitlab','6.9.0'],['node','20.20.0'],['node','28.0.0']]) {
    assert.equal(matchVersion(product,version).status,'review',`${product} ${version}`);
  }
  for(const version of ['', '8.3', '8.3.36-ubuntu1','08.3.36','8.3.36\n','9'.repeat(40)+'.1.1','<script>']) {
    assert.equal(matchVersion('php',version).status,'invalid',version);
  }
  assert.equal(matchVersion('other','1.2.3').status,'invalid');
  assert.equal(matchVersion('gitlab','17.11.0').status,'action');
  assert.equal(matchVersion('plex','1.43.3.10861-abcdef012').status,'floor');
});

test('LiteLLM installed affected artifacts require action while declarations and missing history remain unresolved', () => {
  assert.equal(assessLiteLLM({evidence:'installed',version:'1.107.0'}).status,'action');
  assert.equal(assessLiteLLM({evidence:'executed',version:'1.107.0'}).status,'action');
  assert.equal(assessLiteLLM({evidence:'declared',version:'1.107.0'}).status,'review');
  assert.equal(assessLiteLLM({evidence:'installed',version:'1.106.2'}).status,'review');
  assert.equal(assessLiteLLM({evidence:'unknown',version:''}).status,'review');
  assert.match(assessLiteLLM({evidence:'installed',version:'1.107.0'}).steps.join(' '),/Do not start Python or pip/);
});

test('LiteLLM preserves unknown, declared, installed and executed evidence in every handoff', () => {
  const exports=[];
  for(const evidence of ['unknown','declared','installed','executed']) {
    const result=assessLiteLLM({evidence,version:'1.107.0'});
    assert.equal(result.evidence,evidence);
    const output=makeHandoff({assets:[{alias:'Gateway',product:'litellm',version:'1.107.0',result}]});
    assert.ok(output.includes(result.observation));
    exports.push(output);
  }
  assert.equal(new Set(exports).size,4);
  assert.doesNotMatch(assessLiteLLM({evidence:'unknown',version:'1.107.0'}).summary,/A dependency declaration names/);
});

test('rotation does not close from a replaced value or working deployment alone', () => {
  assert.equal(rotationStatus({issued:true,updated:true,revoked:false,verified:true}),'open');
  assert.equal(rotationStatus({issued:true,updated:true,revoked:true,verified:false}),'open');
  assert.equal(rotationStatus({issued:true,updated:true,revoked:true,verified:true}),'recorded');
});

test('exported handoff preserves evidence limits and open rotation work', () => {
  const output=makeHandoff({assets:[{alias:'Client site',product:'php',version:'8.3.35',result:matchVersion('php','8.3.35')}],rotations:[{alias:'Deploy key',provider:'Example cloud',dependents:'CI',issued:true,updated:true,revoked:false,verified:true}]});
  assert.match(output,/Client site/);
  assert.match(output,/8\.3\.36/);
  assert.match(output,/https:\/\/www\.php\.net/);
  assert.match(output,/OPEN/);
  assert.match(output,/not.*(?:clean|compromise)/i);
});
