// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `options` scenario in the gm test suite.
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
const fs = require('fs');

const checkCmd = (cmd, imageMagick) => {
  switch (imageMagick) {
    case true:
      assert.ok(/^convert /.test(cmd));
      break;
    case '7+':
      assert.ok(/^magick "convert" /.test(cmd));
      break;
    default:
      assert.ok(/^gm "convert" /.test(cmd));
      break;
  }
}

module.exports = function (_, dir, finish, gm, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.

  var sub = gm.subClass({ subclassed: true });
  var s = sub('test').options({ setWithMethod: 2 });
  var g = gm('test').options({ hellowwww: 'there' });

  assert.equal(2, s._options.setWithMethod);
  assert.equal(true, s._options.subclassed);
  assert.equal('there', g._options.hellowwww);
  assert.equal(undefined, g._options.setWithMethod);
  assert.equal(undefined, s._options.hellowwww);
  assert.equal(undefined, g._options.subclassed);

  /// subclass options
  var s2 = sub('another');
  assert.equal(true, s2._options.subclassed);
  assert.equal(undefined, s2._options.setWithMethod);

  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration)
    return finish();

  // test commands
  // test with subclass

  const photoPath = path.join(dir, 'photo.JPG');
  const writeFile = path.join(dir, `options${Math.random()}.png`);
  const instance = gm.subClass({ imageMagick });

  instance(photoPath)
  .negative()
  .write(writeFile, function (err, _1, _2, cmd) {
    if (err) return finish(err);

    checkCmd(cmd, imageMagick);

    fs.stat(writeFile, function (err) {
      if (err) return finish(new Error('did not write file'));

      try {
        fs.unlinkSync(writeFile);
      } catch (e) {}

      /// inline options
      gm(photoPath)
      .negative()
      .options({ imageMagick })
      .write(writeFile, function (err, _1, _2, cmd) {
        if (err) return finish(err);

        checkCmd(cmd, imageMagick);

        fs.stat(writeFile, function (err) {
          if (err) return finish(new Error('did not write 2nd file'));
          try {
            fs.unlinkSync(writeFile);
          } catch (e) {}
          finish();
        });
      });
    });
  });
}
