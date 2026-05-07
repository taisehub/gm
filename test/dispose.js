// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test purpose:
 * This file documents and exercises the `dispose` scenario in the gm test suite.
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

module.exports = function (img, dir, finish, gm, imageMagick) {
  // The first argument is a runner-provided gm chain; some files use it directly and others ignore it.
  // `dir` points at the shared fixture directory under `examples/imgs`.
  // `finish` must be called exactly once so the central queue can report success or failure cleanly.
  // The remaining arguments expose the gm module under test and the backend selector for this run.
  var EventEmitter = require('events').EventEmitter;
  EventEmitter.prototype._maxListeners = 100;

  assert.equal(undefined, gm.prototype._options.disposers);
  assert.equal(undefined, img._options.disposers);

  var emitter = new EventEmitter();

  var disposer = {
    emitter: emitter,
    events: ['pleaseDispose', 'readyToDispose']
  };

  var g = gm('test').options({ disposers: [ disposer ], imageMagick });
  assert.deepEqual([disposer], g._options.disposers);

  var sub = gm.subClass({ disposers: [ disposer ], imageMagick });
  assert.deepEqual([disposer], sub.prototype._options.disposers);

  // Stop after the cheap, non-I/O assertions during unit-only runs.
  // The remaining branch performs real image-processing or filesystem work and therefore only runs in integration mode.
  if (!gm.integration) {
    return finish();
  }

  const photoPath = path.join(dir, 'photo.JPG');
  const disposePath = path.join(dir, 'dispose.png');

  gm(photoPath).options({ disposers: [ disposer ], imageMagick })
  .thumb(1000, 1000, disposePath, function (err) {
    assert.ok(err, "Expecting a disposed error");
  });

  emitter.emit('pleaseDispose');

  noDispose();

  function noDispose() {
    gm(photoPath).options({ disposers: [ disposer ], imageMagick })
    .thumb(1000, 1000, disposePath, function (err) {
      finish(err);
    });
    emitter.emit('disposeOK');
  }
}
