/* Optional smoke test for a running local Express server.
   Run: node scripts/smoke-main.js
   Uses only Node built-ins. */
const assert = require('node:assert/strict');
const BASE_URL = process.env.SITE_URL || 'http://127.0.0.1:3000';
const checks = [
  ['/', 200, 'Zoltan Biro'],
  ['/about', 200, 'about me'],
  ['/projects', 200, 'Project index'],
  ['/project/personal-site', 200, 'Self-Hosted Personal Site'],
  ['/blog', 200, 'Words, sometimes'],
  ['/resume', 200, 'Experience'],
  ['/project/does-not-exist', 404, 'Project not found'],
  ['/this-page-is-missing', 404, 'Nothing here'],
  ['/assets/main/css/style.css', 200, '--accent'],
  ['/assets/main/images/hero-mountains.webp', 200, null],
];
(async () => {
  for (const [path, expectedStatus, expectedText] of checks) {
    const response = await fetch(BASE_URL + path);
    assert.equal(response.status, expectedStatus, `${path}: expected ${expectedStatus}, got ${response.status}`);
    if (expectedText) {
      const body = await response.text();
      assert.ok(body.toLowerCase().includes(expectedText.toLowerCase()), `${path}: missing ${expectedText}`);
    }
    console.log('PASS', response.status, path);
  }
  console.log('All main-site smoke checks passed.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
