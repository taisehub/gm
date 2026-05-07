// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `autoOrientAndThumb` scenario in the gm test suite.
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

module.exports = function (_, dir, finish, gm, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration)
    return finish();

  var original = path.join(dir, 'orientation', 'Portrait_7.jpg');
  var result = path.join(dir, 'autoOrientAndThumb.png');

  size(original, imageMagick, function (err, origSize) {
    if (err) return finish(err);

    assert.ok(origSize.width < 610);
    assert.ok(origSize.height < 460);

    gm(original)
    .options({imageMagick})
    .autoOrient()
    .thumb(100, 100, result, function (err) {
      if (err) return finish(err);

      size(result, imageMagick, function (err, newSize) {
        if (err) return finish(err);
        assert.ok(newSize.width < 80);
        assert.ok(newSize.height < 110);
        finish();
      });

    });
  });

  function size (file, imageMagick, cb) {
    gm(file).options({imageMagick}).identify(function (err, data) {
      if (err) return cb(err);
      cb(err, data.size);
    });
  }
}
