// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `geometry` scenario in the gm test suite.
 * The exported function below is loaded by `test/index.js`, so it depends on the shared runner
 * to supply fixtures, backend selection, and centralized error handling.
 *
 * Reading guide:
 * 1. The early assertions usually validate cheap, deterministic behavior such as generated arguments.
 * 2. The integration guard marks the point where unit-style checks stop.
 * 3. Any code after that guard performs real filesystem or image-processing work and validates output.
 */


var assert = require('assert')

module.exports = function (_, __, finish, GM, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  var a = GM("dummy").options({imageMagick}).geometry("asdf"); // Custom geometry command
  var args = a.args();
  assert.equal('-geometry', args[2]);
  assert.equal('asdf', args[3]);

  var b = GM("dummy").options({imageMagick}).geometry("", 100);
  var args = b.args();
  assert.equal('-geometry', args[2]);
  assert.equal('x100', args[3]); // Keep-aspect-ratio command

  return finish();
}
