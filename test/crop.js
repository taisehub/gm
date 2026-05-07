// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `crop` scenario in the gm test suite.
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
  const m = gm.crop(200, 155, 300, 0);

  const args = m.args();
  assert.equal('convert', args[0]);
  assert.equal('-crop', args[2]);
  assert.equal('200x155+300+0', args[3]);

  const imagePath = path.join(dir, 'image.png');
  const m2 = GM(imagePath).options({ imageMagick }).crop(200, 155, 300, 0, true);

  const args2 = m2.args();
  assert.equal('200x155+300+0%', args2[3]);

  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!GM.integration)
    return finish();

  const destPath = path.join(dir, 'crop.png');
  m.write(destPath, function crop (err) {
    finish(err);
  });
}
