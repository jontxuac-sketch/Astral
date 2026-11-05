import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (await readFile(new URL('../netlify/functions/create-course.mjs', import.meta.url), 'utf8')).replace(/^import .*;\n/gm, '').replace('export default', 'return');
const makeHandler = (generate, user = { id: 'test-account' }) => new Function('OpenAI', 'requireUser', 'jsonError', source)(
  class { constructor() { this.chat = { completions: { create: generate } }; } },
  async () => user ? { user } : { response: Response.json({ error: 'Inicia sesión' }, { status: 401 }) },
  (error, status = 400) => Response.json({ error }, { status }),
);
const request = body => new Request('https://example.com/api/create-course', { method: 'POST', body: JSON.stringify(body) });
const course = { name: 'Biología celular', language: 'eu', targetGrade: 9, sources: [] };
test('creates a real Astra request without requiring materials and preserves the course language', async () => {
  const handler = makeHandler(async payload => {
    assert.equal(payload.model, 'gpt-6-astra');
    assert.equal(JSON.parse(payload.messages[1].content).language, 'eu');
    return { choices: [{ message: { content: JSON.stringify({ sessionsPerWeek: 4, steps: Array.from({ length: 7 }, () => ({ title: 'Zelula', description: 'Azaldu zelularen egitura.' })) }) } }] };
  });
  const result = await handler(request(course));
  assert.equal(result.status, 200);
  const { studyPlan } = await result.json();
  assert.equal(studyPlan.language, 'eu');
  assert.equal(new Set(studyPlan.steps.map(step => step.id)).size, 7);
  assert.equal(studyPlan.model, 'gpt-6-astra');
});
test('rejects unauthenticated and invalid requests before invoking AI', async () => {
  const generate = () => { throw new Error('Must not call AI'); };
  assert.equal((await makeHandler(generate, null)(request(course))).status, 401);
  assert.equal((await makeHandler(generate)(request({ ...course, name: '' }))).status, 400);
  assert.equal((await makeHandler(generate)(request({ ...course, language: 'invalid' }))).status, 400);
});
test('returns a retryable error for provider failures and incomplete plans', async () => {
  for (const generate of [async () => { throw new Error('Provider failed'); }, async () => ({ choices: [{ message: { content: '{}' } }] })]) {
    const result = await makeHandler(generate)(request(course));
    assert.equal(result.status, 502);
    assert.match((await result.json()).error, /Vuelve a intentarlo/);
  }
});
