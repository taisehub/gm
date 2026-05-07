// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `newImage` scenario in the gm test suite.
 * The exported function below is loaded by `test/index.js`, so it depends on the shared runner
 * to supply fixtures, backend selection, and centralized error handling.
 *
 * Reading guide:
 * 1. The early assertions usually validate cheap, deterministic behavior such as generated arguments.
 * 2. The integration guard marks the point where unit-style checks stop.
 * 3. Any code after that guard performs real filesystem or image-processing work and validates output.
 */

// https://github.com/aheckmann/gm/issues/127

const path = require('path');
const fs = require('fs')

module.exports = function (_, dir, finish, gm, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration)
    return finish();

  const dest1Path = path.join(dir, 'ignore.me.png');
  createImage().write(dest1Path, function (err) {
    if (err) return finish(err);

    createImage().stream(function (err, stdout) {
      if (err) return finish(err);

      const dest2Path = path.join(dir, 'ignore.me.2.png');
      stdout.pipe(fs.createWriteStream(dest2Path))

      stdout.on('error', finish)
      stdout.on('end', finish)
    })
  })

  function createImage() {
    return gm(70, 30, '#000')
      .options({imageMagick})
      .font("arial", 20)
      .stroke("#fff", 2)
      .fill("#888")
      .drawText(10, 22, 'Some text')
  }
}
