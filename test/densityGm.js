// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `densityGm` scenario in the gm test suite.
 * The exported function below is loaded by `test/index.js`, so it depends on the shared runner
 * to supply fixtures, backend selection, and centralized error handling.
 *
 * Reading guide:
 * 1. The early assertions usually validate cheap, deterministic behavior such as generated arguments.
 * 2. The integration guard marks the point where unit-style checks stop.
 * 3. Any code after that guard performs real filesystem or image-processing work and validates output.
 */

const assert = require('assert')
const path = require('path');

module.exports = function (gm, dir, finish, GM, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  var NUMBER = 100;
  var NUMBER2 = 200;
  var g = gm.density(NUMBER, NUMBER2);
  var gArgs = g.args();
  assert.equal('convert', gArgs[0]);
  assert.equal('-density', gArgs[1]);
  assert.equal(NUMBER + 'x' + NUMBER2, gArgs[2]);

  if (imageMagick) {
    // graphicsmagick does not support density with two arguments
    var imArgs = GM().options({imageMagick}).density(NUMBER).args();
    assert.equal('convert', imArgs[0]);
    assert.equal('-density', imArgs[1]);
    assert.equal(NUMBER, imArgs[2]);
  }

  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!GM.integration) return finish();

  const destPath = path.join(dir, 'density.png');
  g.write(destPath, function density (err) {
    finish(err);
  });
};
