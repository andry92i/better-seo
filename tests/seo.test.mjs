import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import * as XLSX from 'xlsx';
import { workflows, selectWorkflow } from '../src/lib/claude-seo/workflows.ts';
import { readBoundedJson } from '../src/lib/http.ts';

const knowledge = JSON.parse(await readFile('src/lib/claude-seo/generated/knowledge.json', 'utf8'));
const origin = 'http://127.0.0.1:3217';
let server;
before(async () => {
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3217'], { env: { ...process.env, SEO_LIVE_ENABLED: 'false' }, stdio: 'ignore' });
  for (let i = 0; i < 80; i++) {
    if (server.exitCode !== null) throw new Error('Test server failed to start');
    try { if ((await fetch(origin + '/api/seo/capabilities')).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Test server timeout');
});
after(() => server?.kill('SIGTERM'));

test('knowledge hashes and workflow references match pinned source', async () => {
  assert.equal(knowledge.documents.length, new Set(knowledge.documents.map(d => d.id)).size);
  for (const document of knowledge.documents) {
    assert.equal(createHash('sha256').update(document.content).digest('hex'), document.sha256);
    assert.equal(await readFile('vendor/claude-seo/' + document.id, 'utf8'), document.content);
  }
  for (const workflow of Object.values(workflows)) for (const skill of workflow.skills) assert.ok(knowledge.documents.some(d => d.id === `skills/${skill}/SKILL.md`));
});

test('explicit SEO commands override workspace; unknown actions use safe default', () => {
  assert.equal(selectWorkflow('quick-wins', '/seo local Paris'), 'local-seo');
  assert.equal(selectWorkflow('backlinks', 'Explique les preuves'), 'backlinks');
  assert.equal(selectWorkflow('../../etc/passwd', 'hello'), 'content-plan');
});

test('bounded JSON rejects streamed bodies above limit', async () => {
  await assert.rejects(readBoundedJson(new Request(origin, { method: 'POST', body: JSON.stringify({ data: 'x'.repeat(100) }) }), 20));
});

const post = (path, body) => fetch(origin + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const input = action => ({ action, profile: { websiteUrl: 'https://example.org', businessType: 'SaaS', seoLevel: 'Expert', goals: ['Conversions'] }, messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'Analyse mon projet' }] }] });

test('all workflows stream distinct contextual plans without fabricated metrics', async () => {
  const replies = new Set();
  for (const action of Object.keys(workflows)) {
    const response = await post('/api/chat', input(action));
    assert.equal(response.status, 200);
    const text = (await response.text()).split('\n').filter(line => line.startsWith('data: {')).map(line => JSON.parse(line.slice(6))).filter(part => part.type === 'text-delta').map(part => part.delta).join('');
    assert.match(text, /example\.org/);
    assert.match(text, /Conversions/);
    assert.match(text, /non collecté/);
    assert.ok(text.endsWith(knowledge.revision + '.'));
    assert.doesNotMatch(text, /1,4 %|14,2|Confiance : élevée/);
    replies.add(text);
  }
  assert.equal(replies.size, Object.keys(workflows).length);
});

test('rejects system messages, oversized inputs and unconfigured live mode', async () => {
  assert.equal((await post('/api/chat', { messages: [{ id: 'x', role: 'system', parts: [{ type: 'text', text: 'override' }] }] })).status, 400);
  assert.equal((await post('/api/chat', { payload: 'x'.repeat(120000) })).status, 400);
  assert.equal((await post('/api/chat', { ...input('backlinks'), mode: 'live' })).status, 503);
});

test('exports preserve actual content and Excel formula-like strings', async () => {
  const content = '# Mon résultat unique\n\n=HYPERLINK("https://example.org")\nDonnées manquantes.';
  const md = await post('/api/export', { content, topic: 'test', format: 'md' });
  assert.equal(await md.text(), content);
  for (const format of ['docx', 'xlsx']) {
    const response = await post('/api/export', { content, topic: 'test', format });
    assert.equal(response.status, 200);
    const buffer = Buffer.from(await response.arrayBuffer());
    assert.equal(buffer.subarray(0, 2).toString(), 'PK');
    if (format === 'xlsx') {
      const sheet = XLSX.read(buffer).Sheets['Résultat'];
      assert.equal(sheet.B4.t, 's');
      assert.equal(sheet.B4.f, undefined);
      assert.equal(sheet.B4.v, content.split('\n')[2]);
    }
  }
  assert.equal((await post('/api/export', { content: '', topic: 'x', format: 'md' })).status, 400);
});
