// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `resizeWrong` scenario in the gm test suite.
 * The exported function below is loaded by `test/index.js`, so it depends on the shared runner
 * to supply fixtures, backend selection, and centralized error handling.
 *
 * Reading guide:
 * 1. The early assertions usually validate cheap, deterministic behavior such as generated arguments.
 * 2. The integration guard marks the point where unit-style checks stop.
 * 3. Any code after that guard performs real filesystem or image-processing work and validates output.
 */

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

  const original = path.join(dir, 'original.png');
  const resized = path.join(dir, 'resize');
  var widths = [300, 700, 400, 800, 200], i, cb;
  var resizeExact = function (width, index) {
    var name = resized + index + '.png';

    if (index == widths.length) {
      return finish();
    } else {
      index++;
    }
    gm(original)
      .options({imageMagick})
      .resizeExact(width)
      .write(name, function(err){
        if (err) return finish(err);

        gm(name).options({imageMagick})
          .size(function (err, size) {
            if (err) return finish(err);
            if (size.width !== width) {
              return finish("Wrong resizing on requested:" + width + ", resized:" + size.width);
            }

            if (cb) return cb();
            resizeExact(widths[index], index);
          });
      });
  };

  resizeExact(widths[0], 0);
}