// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `getterSize` scenario in the gm test suite.
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

module.exports = function (_, dir, finish, gm, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration)
    return finish();

  sizeJPEG(function (err) {
    if (err) return finish(err);

    sizeGIF(function (err) {
      if (err) return finish(err);

      sizePNG(finish);
    })
  })

  function sizeJPEG(done) {
    const originalPath = path.join(dir, 'original.jpg');
    gm(originalPath).options({imageMagick}).size(function gettersize (err, size) {
      if (err) return done(err);

      assert.equal(size.width, 460);
      assert.equal(size.height, 155);

      const identifyParseErrPath = path.join(dir, 'identifyParseErr.jpg');
      gm(identifyParseErrPath).options({imageMagick}).size(done);
    });
  }

  function sizeGIF(done) {
    const originalGifPath = path.join(dir, 'original.gif');
    gm(originalGifPath).options({imageMagick}).size(function (err, size) {
      if (err) return done(err);

      assert.equal(size.width, 192)
      assert.equal(size.height, 56)

      done()
    })
  }

  function sizePNG(done) {
    const originalPngPath = path.join(dir, 'original.png');
    gm(originalPngPath).options({imageMagick}).size(function (err, size) {
      if (err) return done(err);

      assert.equal(size.width, 460)
      assert.equal(size.height, 155)

      done()
    })
  }
}
