// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `fromBuffer` scenario in the gm test suite.
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

  const original = path.join(dir, 'original.jpg');
  const result = path.join(dir, 'fromBuffer.png');

  var buf = fs.readFileSync(original);

  var m = gm(buf).options({imageMagick}).rotate('red', 30);

  var args = m.args();
  assert.equal('convert', args[0]);
  assert.equal('-', args[1]);
  assert.equal('-background', args[2]);
  assert.equal('red', args[3]);
  assert.equal('-rotate', args[4]);
  assert.equal(30, args[5]);

  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration)
    return finish();

  m.write(result, function crop (err) {
    if (err) return finish(err);

    // tolerance defaults to 0.4
    m.compare(original, result, function (err, equal) {
      if (err) return finish(err);
      assert.ok(equal);

      // accepts tolerance argument
      m.compare(original, result, 0.1, function (err, equal, equality, raw) {
        if (err) return finish(err);
        assert.ok(!equal);
        assert.ok(equality > 0.1);
        assert.ok(raw);
        finish();
      })
    })
  });
}
