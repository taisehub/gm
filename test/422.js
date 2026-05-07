// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `422` scenario in the gm test suite.
 * The exported function below is loaded by `test/index.js`, so it depends on the shared runner
 * to supply fixtures, backend selection, and centralized error handling.
 *
 * Reading guide:
 * 1. The early assertions usually validate cheap, deterministic behavior such as generated arguments.
 * 2. The integration guard marks the point where unit-style checks stop.
 * 3. Any code after that guard performs real filesystem or image-processing work and validates output.
 */

const fs = require('fs');
const path = require('path');

module.exports = function (gm, dir, finish, GM, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  // Same image
  const originalPathName = path.join(dir, 'original.jpg');

  gm.compare(originalPathName, originalPathName, function(err, same, diff) {
    if (err) return finish(err);
    if (!same) {
      const msg = `Compare should be the same! "${same}" "${diff}"`;
      return finish(new Error(msg));
    }

    // Compare almost similar images for which ImageMagick
    // returns an exponent-style floating point number
    const compare1PathName = path.join(__dirname, 'fixtures', 'compare_1.png');
    const compare2PathName = path.join(__dirname, 'fixtures', 'compare_2.png');

    gm.compare(compare1PathName, compare2PathName, function(err, same, diff) {
      if (err) return finish(err);
      if (!same) {
        const msg = `Compare should be the same! "${same}" "${diff}"`;
        return finish(new Error(msg));
      }

      const noisePathName = path.join(dir, 'noise3.png');

      // Create a new noisy image
      gm.noise(0.3).write(noisePathName, function (err) {
        if (err) return finish(err);

        var options = {
          highlightColor: '#fff',
          file: path.join(dir, 'diff.png'),
          tolerance: 0.001
        };

        const originalPathName = path.join(dir, 'original.jpg');

        // Compare these images and write to a file.
        gm.compare(originalPathName, noisePathName, options, function(err) {
          if (err) return finish(err);

          fs.access(options.file, fs.constants.F_OK, function(err) {
            if (err) {
              finish(new Error('Diff file does not exist.'));
            } else {
              fs.unlink(options.file, finish);
            }
          });
        });
      });
    });
  });
};
