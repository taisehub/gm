// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `inputIs` scenario in the gm test suite.
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

module.exports = function (_, dir, finish, gm) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  var err;

  try {
    const blahPath = path.join('path', 'to', 'blah.gif') ;
    var gif = gm(blahPath);
    assert.equal(true, gif.inputIs('gif'));
    assert.equal(false, gif.inputIs('jpg'));
    assert.equal(false, gif.inputIs('crazy'));

    var png = gm('png.png');
    assert.equal(true, png.inputIs('png'));
    assert.equal(false, png.inputIs('gif'));
    assert.equal(false, png.inputIs('tif'));

    const jpgPath = path.join('super', 'duper.jpeg')
    var jpg = gm(jpgPath);
    assert.equal(true, jpg.inputIs('jpg'));
    assert.equal(true, jpg.inputIs('jpeg'));
    assert.equal(false, jpg.inputIs('gif'));
    assert.equal(false, jpg.inputIs('tif'));
    assert.equal(false, jpg.inputIs('gif'));

    var unknown = gm('super.unknown');
    assert.equal(true, unknown.inputIs('unknown'));
    assert.equal(true, unknown.inputIs('.unknown'));
    assert.equal(false, unknown.inputIs());
    assert.equal(false, unknown.inputIs(''));
    assert.equal(false, unknown.inputIs('png'));
    assert.equal(false, unknown.inputIs('pngasdf'));
  } catch (e) {
    err = e;
    console.error(e.stack);
  }

  finish(err);
}
