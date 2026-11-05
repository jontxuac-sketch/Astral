import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM, VirtualConsole } from 'jsdom';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const script = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
function page(courses = []) {
  const errors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(html, { url: 'https://example.com', runScripts: 'outside-only', virtualConsole: console });
  dom.window.fetch = async () => ({ ok: true, headers: new Headers({ 'content-type': 'application/json' }), json: async () => ({ user: null }) });
  dom.window.localStorage.setItem('astra-demo-courses', JSON.stringify(courses));
  dom.window.eval(script);
  return { dom, document: dom.window.document, errors };
}
for (const id of ['continueBtn', 'newCourseBtn', 'addBtn']) {
  test(`${id} opens the creation form on a new account`, () => {
    const { dom, document, errors } = page();
    try {
      document.getElementById(id).click();
      assert.equal(errors.length, 0, errors[0]?.message);
      assert.ok(document.querySelector('#modalWrap.open'));
      assert.ok(document.querySelector('#courseName'));
      assert.equal(document.querySelector('#targetGrade').value, '8');
      assert.equal(document.querySelector('#saveCourseSources').textContent, 'Crear curso');
    } finally { dom.window.close(); }
  });
}
test('renders the empty state and its first-course button opens the form', () => {
  const { dom, document, errors } = page();
  try {
    assert.ok(document.querySelector('#emptyCreateCourse'));
    document.querySelector('#emptyCreateCourse').click();
    assert.equal(errors.length, 0, errors[0]?.message);
    assert.ok(document.querySelector('#modalWrap.open'));
  } finally { dom.window.close(); }
});
test('add material opens the existing course instead of creating another', () => {
  const { dom, document, errors } = page([{ id: 'biology', name: 'Biología', sources: [], targetGrade: 8.5, language: 'es' }]);
  try {
    document.querySelector('#addBtn span').click();
    assert.equal(errors.length, 0, errors[0]?.message);
    assert.equal(document.querySelector('#modalTitle').textContent, 'Añadir materiales');
    assert.equal(document.querySelector('#courseSelect').value, 'biology');
    assert.equal(document.querySelector('#targetGrade').value, '8.5');
    assert.equal(document.querySelectorAll('.course-card').length, 1);
  } finally { dom.window.close(); }
});
