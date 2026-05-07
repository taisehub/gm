// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `429` scenario in the gm test suite.
 * The exported function below is loaded by `test/index.js`, so it depends on the shared runner
 * to supply fixtures, backend selection, and centralized error handling.
 *
 * Reading guide:
 * 1. The early assertions usually validate cheap, deterministic behavior such as generated arguments.
 * 2. The integration guard marks the point where unit-style checks stop.
 * 3. Any code after that guard performs real filesystem or image-processing work and validates output.
 */

const fs = require('fs');
const path = require('path');

module.exports = function (gm, dir, finish, GM, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!GM.integration)  return finish();

  const ico = path.join(__dirname, 'fixtures', 'test.ico');
  const buffer = fs.readFileSync(ico);
  const stream = fs.createReadStream(ico);

  GM(ico).options({ imageMagick }).size(function (err) {
    if (err) {
      err.message = 'Failed using ico filename. ' + err.message;
      return finish(err);
    }

    GM(buffer, 'img.ico').options({ imageMagick }).size(function (err) {
      if (err) {
        err.message = 'Failed using ico buffer. ' + err.message;
        return finish(err);
      }

      GM(stream, 'img.ico').options({ imageMagick }).size({bufferStream: true}, function (err) {
        if (err) {
          err.message = 'Failed using ico stream. ' + err.message;
          return finish(err);
        }
        finish();
      });
    });
  });
}