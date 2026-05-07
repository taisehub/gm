// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `new` scenario in the gm test suite.
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

  var m = gm(525, 110, "#00ff55aa")
  .options({imageMagick})
  .fontSize(68)
  .stroke("#efe", 2)
  .fill("#555")
  .drawText(20, 72, "graphics")
  .fill("#fa0")
  .drawText(274, 72, " magick");

  var args = m.args();
  assert.deepEqual(args, [
    'convert',
    '-size',
    '525x110',
    'xc:#00ff55aa',
    '-pointsize',
    68,
    '-strokewidth',
    2,
    '-stroke',
    '#efe',
    '-fill',
    '#555',
    '-draw',
    'text 20,72 "graphics"',
    '-fill',
    '#fa0',
    '-draw',
    'text 274,72 "magick"',
    '-'
  ])

  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration)
    return finish();

  const destPath = path.join(dir, 'new.png');
  m.write(destPath, function New (err){
    finish(err);
  });
}
