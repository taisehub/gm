// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `compare` scenario in the gm test suite.
 * The exported function below is loaded by `test/index.js`, so it depends on the shared runner
 * to supply fixtures, backend selection, and centralized error handling.
 *
 * Reading guide:
 * 1. The early assertions usually validate cheap, deterministic behavior such as generated arguments.
 * 2. The integration guard marks the point where unit-style checks stop.
 * 3. Any code after that guard performs real filesystem or image-processing work and validates output.
 */

const path = require('path');
const fs = require('fs');

module.exports = function (gm, dir, finish) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  // Same image
  const originalJPGFilePath = path.join(dir, 'original.jpg');
  const originalPNGFilePath = path.join(dir, 'original.png');

  gm.compare(originalJPGFilePath, originalPNGFilePath, function(err, same) {
    if (err) return finish(err);
    if (!same) return finish(new Error('Compare should be the same!'));

    // Compare almost similar images for which ImageMagick
    // returns a exponent-style floating point number
    const compare1Path = path.join(__dirname, 'fixtures', 'compare_1.png');
    const compare2Path = path.join(__dirname, 'fixtures', 'compare_2.png');

    gm.compare(compare1Path, compare2Path, function(err, same, diff) {
      if (err) return finish(err);
      if (!same) return finish(new Error('Compare should be the same!'));

      // Create a new noisy image
      const noisePath = path.join(dir, 'noise3.png');
      gm.noise(0.3).write(noisePath, function (err) {
        if (err) return finish(err);

        const options = {
          highlightColor: 'yellow',
          file: path.join(dir, `compare-test-${Date.now()}.png`),
          tolerance: 0.001
        };

        // Compare these images and write to a file.
        gm.compare(originalJPGFilePath, noisePath, options, function(err) {
          if (err) return finish(err);

          fs.access(options.file, fs.constants.F_OK, function(err) {
            if (err) {
              finish(new Error('Diff file does not exist.'));
            } else {
              fs.unlink(options.file, () => finish());
            }
          });
        });
      });
    });
  });
};