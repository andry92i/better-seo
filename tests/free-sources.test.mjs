import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSeoConfig } from '../src/lib/ai/config.ts';
import { createGrokModel } from '../src/lib/ai/grok.ts';
import { workflows } from '../src/lib/claude-seo/workflows.ts';
import { freeDataPolicy, freeDataInstructions } from '../src/lib/seo-data-policy.ts';

const configured = { SEO_LIVE_ENABLED:'true', GROK_API_KEY:'test-only-key',
  DATABASE_URL:'postgresql://example', BETTER_AUTH_URL:'https://example.org',
  BETTER_AUTH_SECRET:'a'.repeat(32) };
test('Grok key and actual configuration gate are required; Gateway never enables live mode', () => {
  assert.equal(getSeoConfig(configured).liveConfigured, true);
  assert.equal(getSeoConfig(configured).model, 'grok-4.6');
  assert.equal(getSeoConfig({...configured, GROK_API_KEY:'', AI_GATEWAY_API_KEY:'old-key'}).liveConfigured, false);
  assert.equal(getSeoConfig({...configured, SEO_MODEL:'xai/grok-4.6'}).liveConfigured, false);
  assert.equal(getSeoConfig({...configured, BETTER_AUTH_URL:''}).liveConfigured, false);
  assert.equal(getSeoConfig({...configured, BETTER_AUTH_SECRET:'replace-with-at-least-32-random-characters'}).liveConfigured, false);
});
test('provider request goes directly to xAI with the configured Grok key', async () => {
  let captured;
  const model = createGrokModel('grok-4.6', {apiKey:'test-only-key',fetch:async (url,init)=>{
    captured = {url:String(url), headers:new Headers(init.headers), body:JSON.parse(init.body)};
    throw new Error('Stopped by test before any network call');
  }});
  await assert.rejects(model.doGenerate({prompt:[{role:'user',content:[{type:'text',text:'Test'}]}]}));
  assert.equal(new URL(captured.url).origin, 'https://api.x.ai');
  assert.equal(captured.headers.get('authorization'), 'Bearer test-only-key');
  assert.equal(captured.body.model, 'grok-4.6');
  assert.throws(()=>createGrokModel('xai/grok-4.6',{apiKey:'test'}));
});
test('active workflows and source catalog do not depend on paid SEO providers', () => {
  assert.equal(freeDataPolicy.paidSeoProviders,false);
  assert.doesNotMatch(JSON.stringify(workflows), /seo-dataforseo|Ahrefs|fournisseur de mots-clés/);
  assert.doesNotMatch(JSON.stringify(freeDataPolicy.sources), /dataforseo|ahrefs|semrush/i);
  assert.match(freeDataInstructions,/Une impression n’est pas un volume/);
  assert.match(freeDataInstructions,/pas d’API|export CSV/);
});
