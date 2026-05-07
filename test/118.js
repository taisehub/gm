// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `118` scenario in the gm test suite.
 * The exported function below is loaded by `test/index.js`, so it depends on the shared runner
 * to supply fixtures, backend selection, and centralized error handling.
 *
 * Reading guide:
 * 1. The early assertions usually validate cheap, deterministic behavior such as generated arguments.
 * 2. The integration guard marks the point where unit-style checks stop.
 * 3. Any code after that guard performs real filesystem or image-processing work and validates output.
 */

/*
 * If only the width is specified for a resize operation,
 * GraphicsMagick requires the format
 * -resize 10x
 * while ImageMagick requires the format
 * -resize 10
 *
 */
const assert = require('assert')
const path = require('path');

module.exports = function (_, dir, finish, gm, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration) return finish();

  var src = path.join(dir, 'originalSideways.jpg');
  var dst = path.join(dir, 'originalSideways10x.jpg');

  gm(src).options({ imageMagick }).resize(10).write(dst, function(err) {
    gm(dst).options({ imageMagick }).size(function(err, size) {
      if (err) return finish(err);
      assert.equal(10, size.width);
      finish();
    });
  });

}
