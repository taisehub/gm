// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `resizeAndAutoOrientFromBuffer` scenario in the gm test suite.
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
const fs = require('fs')

module.exports = function (_, dir, finish, gm, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.

  const original = path.join(dir, 'orientation', 'Portrait_7.jpg');
  const result = path.join(dir, 'resizeAutoOrientFromBuffer.png');

  var buf = fs.readFileSync(original);

  var m = gm(buf, 'resizefrombuffer.jpg')
  .options({imageMagick})
  .autoOrient()
  .resize('20%')

  const expectedArgs = imageMagick ?
    ['convert', '-', '-auto-orient', '-resize', '20%', '-'] :
    ['convert', '-', '-resize', '20%x', '-'];

  assert.deepEqual(m.args(), expectedArgs);

  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration)
    return finish();

  size(original, imageMagick, function (err, origSize) {
    if (err) return finish(err);

    m
    .write(result, function resizeFromBuffer (err) {
      if (err) return finish(err);

      size(result, imageMagick, function (err, newSize) {
        if (err) return finish(err);
        assert.ok(origSize.width / 2 >= newSize.width);
        assert.ok(origSize.height / 2 >= newSize.height);
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
