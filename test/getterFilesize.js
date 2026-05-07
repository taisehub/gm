// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `getterFilesize` scenario in the gm test suite.
 * The exported function below is loaded by `test/index.js`, so it depends on the shared runner
 * to supply fixtures, backend selection, and centralized error handling.
 *
 * Reading guide:
 * 1. The early assertions usually validate cheap, deterministic behavior such as generated arguments.
 * 2. The integration guard marks the point where unit-style checks stop.
 * 3. Any code after that guard performs real filesystem or image-processing work and validates output.
 */


var assert = require('assert')

module.exports = function (gm, dir, finish, GM) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!GM.integration)
    return finish();

  gm
  .filesize(function getterfilesize (err, size) {
    if (err) return finish(err);

    if (this._options.imageMagick) {
      assert.equal('7792B', size, size);
    } else {
      assert.ok(/7.6K[i]{0,1}/.test(size));
    }

    assert.equal(size, this.data.Filesize)

    // make sure we are reading from the data cache and not
    // hitting the fs again.
    this.identify = function () {
      assert.ok(false, 'Did not read from cache');
    }

    this.filesize(function (err, size) {
      if (err) return finish(err);

      if (this._options.imageMagick) {
        assert.equal('7792B', size, size);
      } else {
        assert.ok(/7.6K[i]{0,1}/.test(size));
      }

      assert.equal(size, this.data.Filesize)
      finish();
    });

  });
}
