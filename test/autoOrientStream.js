// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `autoOrientStream` scenario in the gm test suite.
 * The exported function below is loaded by `test/index.js`, so it depends on the shared runner
 * to supply fixtures, backend selection, and centralized error handling.
 *
 * Reading guide:
 * 1. The early assertions usually validate cheap, deterministic behavior such as generated arguments.
 * 2. The integration guard marks the point where unit-style checks stop.
 * 3. Any code after that guard performs real filesystem or image-processing work and validates output.
 */


// gm - Copyright Aaron Heckmann <aaron.heckmann+github@gmail.com> (MIT Licensed)
// This is a copy of `autoOrient.js` using streams

const assert = require('assert')
const fs = require('fs')
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

  const filename = path.join(dir, 'autoOrientStream.jpg');
  const sidewaysPathName = path.join(dir, 'originalSideways.jpg');

  gm(fs.createReadStream(sidewaysPathName)).options({imageMagick}).identify(function (err) {
    if (err) return finish(err);

    const geo = imageMagick ? '155x460+0+0' : '155x460';
    assert.equal(geo, this.data.Geometry);

    // this image is sideways, but may be auto-oriented by modern OS's
    // try opening it in a browser to see its true orientation
    gm(fs.createReadStream(sidewaysPathName))
    .options({imageMagick})
    .autoOrient()
    .write(filename, function autoOrient (err) {
      if (err) return finish(err);

      // fs race condition
      setTimeout(function () {
        gm(filename).options({imageMagick}).identify(function (err) {
          if (err) return finish(err);

          const geo2 = imageMagick ? '460x155+0+0' : '460x155';
          assert.equal(geo2, this.data.Geometry);

          finish(err);
        });
      }, 200);
    });
  });
}
