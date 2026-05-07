// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `streamOutFormat` scenario in the gm test suite.
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
const fs = require('fs');

module.exports = function (gm, dir, finish, GM, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!GM.integration)
    return finish();

  withCallback(function (err) {
    if (err) return finish(err);

    withoutCallback(function (err) {
      if (err) return finish(err);

      checkOutputFormat(finish);
    });
  });

  function withCallback(done) {
    gm
    .stream('PNG', function streamOut (err, stdout, stderr) {
      if (err) return done(err);
      const destPath = path.join(dir, 'streamOutFormat.png');
      stdout.pipe(fs.createWriteStream(destPath));
      stdout.on('error', done);
      stdout.on('close', done);
    });
  }

  function withoutCallback(done) {
    var stream = gm.stream('PNG')
    stream.on('error', done)
    const destPath = path.join(dir, 'streamOutFormat2.png');
    stream.pipe(fs.createWriteStream(destPath))
    stream.on('end', done)
  }

  function checkOutputFormat(done) {
    var stream = gm.stream('PNG')
    stream.on('error', done)
    GM(stream).options({imageMagick}).format(function (err, value) {
      if (err)
        return done(err)

      assert.equal(value.toLowerCase(), 'png')
      done()
    })
  }
}
