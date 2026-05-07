// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `timeout` scenario in the gm test suite.
 * The exported function below is loaded by `test/index.js`, so it depends on the shared runner
 * to supply fixtures, backend selection, and centralized error handling.
 *
 * Reading guide:
 * 1. The early assertions usually validate cheap, deterministic behavior such as generated arguments.
 * 2. The integration guard marks the point where unit-style checks stop.
 * 3. Any code after that guard performs real filesystem or image-processing work and validates output.
 */

const assert = require('assert');
const path = require('path');

module.exports = function (img, dir, finish, gm, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.

  assert.equal(undefined, gm.prototype._options.timeout);
  assert.equal(undefined, img._options.timeout);

  var g = gm('test').options({ timeout: 100 });
  assert.equal(100, g._options.timeout);

  var sub = gm.subClass({ timeout: 2000 });
  assert.equal(2000, sub.prototype._options.timeout);


  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration)
    return finish();

  const sourcePath = path.join(dir, 'photo.JPG');
  const timeoutPath = path.join(dir, 'timeout.png');
  gm(sourcePath).options({ timeout: 1, imageMagick })
  .thumb(50, 80, timeoutPath, function subthumb (err) {
    assert.ok(err, "Expecting a timeout error");
    noTimeout();
  });


  function noTimeout() {
    gm(sourcePath).options({ timeout: 0, imageMagick })
    .thumb(50, 80, timeoutPath, function subthumb (err) {
      finish(err);
    });
  }

}
