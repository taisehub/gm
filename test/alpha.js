// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `alpha` scenario in the gm test suite.
 * The exported function below is loaded by `test/index.js`, so it depends on the shared runner
 * to supply fixtures, backend selection, and centralized error handling.
 *
 * Reading guide:
 * 1. The early assertions usually validate cheap, deterministic behavior such as generated arguments.
 * 2. The integration guard marks the point where unit-style checks stop.
 * 3. Any code after that guard performs real filesystem or image-processing work and validates output.
 */

const assert = require('assert');
const Async = require('async');
const path = require('path');

module.exports = function (_, dir, finish, gm, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration) return finish();

  var alphaTypes = [
    "Activate",
    "On",
    "Deactivate",
    "Off",
    "Set",
    "Opaque",
    "Transparent",
    "Extract",
    "Copy",
    "Shape",
    "Background"
  ];

  const edgePath = path.join(dir, 'original.png');
  const failPath = path.join(dir, 'alpha_fail.png');

  // alpha not supported by GM so only test IM
  if (!imageMagick) {
    assert.throws(function() {
      gm(edgePath)
        .alpha(alphaTypes.pop())
        .write(failPath);
    });
    finish();
  } else {

    Async.eachSeries(alphaTypes, function(alphaType, cb) {
      var m = gm(edgePath).options({imageMagick}).alpha( alphaType );
      var args = m.args();
      assert.equal('convert', args[0]);
      assert.equal('-alpha', args[2]);
      assert.equal(alphaType, args[3]);

      const writePath = path.join(dir, `alpha_${alphaType}.png`);
      m.write(writePath, cb);
    }, finish);
  }
}
