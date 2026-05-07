// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `append` scenario in the gm test suite.
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
  const out = path.resolve(dir, 'append.jpg');
  const lostPath = path.join(dir, 'lost.png');
  const originalPath = path.join(dir, 'original.jpg');

  try {
    require('fs').unlinkSync(out);
  } catch (_) {}

  var m = gm(lostPath)
  .options({imageMagick})
  .append(originalPath, originalPath)
  .append()
  .background('#222')

  var args = m.args();
  assert.equal('convert', args[0]);
  assert.equal('-background',args[1]);
  assert.equal('#222',args[2]);
  assert.ok(/lost\.png$/.test(args[3]));
  assert.ok(/original\.jpg$/,args[4]);
  assert.ok(/original\.jpg$/,args[5]);
  assert.equal('-append',args[6]);
  assert.equal('-',args[7]);

  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration) {
    return horizontal({ dir, finish, gm, originalPath, lostPath, imageMagick });
  }

  m.write(out, function (err) {
    if (err) return finish(err);
    gm(out)
    .options({imageMagick})
    .size(function (err, size) {
      if (err) return finish(err);
      assert.equal(460, size.width);
      assert.equal(435, size.height);

      horizontal({ dir, finish, gm, originalPath, lostPath, imageMagick });
    })
  });
}

function horizontal ({ dir, finish, gm, originalPath, lostPath, imageMagick }) {
  var out = path.resolve(dir, 'appendHorizontal.jpg');

  var m = gm(originalPath).append(lostPath, true).options({imageMagick});

  var args = m.args();
  assert.equal('convert', args[0]);
  assert.ok(/original\.jpg$/.test(args[1]));
  assert.ok(/lost\.png$/.test(args[2]));
  assert.equal('+append',args[3]);
  assert.equal('-',args[4]);

  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration) {
    return finish();
  }

  m.write(out, function (err) {
    if (err) return finish(err);
    gm(out).options({imageMagick}).size(function (err, size) {
      if (err) return finish(err);
      assert.equal(697, size.width);
      assert.equal(155, size.height);

      finish();
    })
  });

}
