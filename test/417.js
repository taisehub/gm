// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `417` scenario in the gm test suite.
 * The exported function below is loaded by `test/index.js`, so it depends on the shared runner
 * to supply fixtures, backend selection, and centralized error handling.
 *
 * Reading guide:
 * 1. The early assertions usually validate cheap, deterministic behavior such as generated arguments.
 * 2. The integration guard marks the point where unit-style checks stop.
 * 3. Any code after that guard performs real filesystem or image-processing work and validates output.
 */


const assert = require('assert')
const fs = require('fs');
const path = require('path');

module.exports = function (_, dir, finish, gm, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration)
    return finish();

  const originalPathName = path.join(dir, 'original.jpg');
  const thumbPathName = path.join(dir, 'thumb.png');

  gm(originalPathName).options({ imageMagick }).thumb(150, 40, thumbPathName, function thumb (err) {
    gm(thumbPathName).options({ imageMagick }).size(function (err, size) {
      if (err) return finish(err);

      assert.equal(142, size.width);
      assert.equal(40, size.height);

      gm(originalPathName).options({ imageMagick }).thumbExact(150, 40, thumbPathName, function thumb (err) {
        gm(thumbPathName).options({ imageMagick }).size(function (err, size) {
          assert.equal(150, size.width);
          assert.equal(40, size.height);
          finish(err);
        });
      });
    });
  });
}
