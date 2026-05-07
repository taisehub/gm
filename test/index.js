// 2026-05-08 01:17:47 CST +0800
// forked by taisehub

/*
 * Test runner overview:
 * This file is the lightweight harness for every test module in this directory.
 * It discovers test files, decides which external backend binaries are available,
 * and runs each test once for every supported backend configuration.
 *
 * Reading guide:
 * 1. Command-line flags optionally enable integration mode and file-level filtering.
 * 2. Backend probes detect GraphicsMagick, legacy ImageMagick, and ImageMagick 7+ support.
 * 3. The Async queue executes tests serially so temporary files and shared fixtures stay predictable.
 */

const cp = require('child_process');
const path = require('path');
const Async = require('async');
const dir = path.join(__dirname, '..', 'examples', 'imgs');
const gm = require('..');
const fs = require('fs');
const os = require('os');

// Extra CLI arguments can be used to narrow the run to specific test filenames.
// Passing `--integration` switches the suite from argument-only checks to real image-processing work.
const only = process.argv.slice(2);
gm.integration = !! ~process.argv.indexOf('--integration');
if (gm.integration) only.shift();

// Discover every test module in this directory after applying the optional filename filter.
let files = fs.readdirSync(__dirname).filter(filter);
if (files.length === 0) {
  console.log('No tests found matching', only);
}

function filter (file) {
  if (!/\.js$/.test(file)) return false;
  if ('index.js' === file) return false;
  if (only.length && !~only.indexOf(file)) return false;

  var filename = path.join(__dirname, file);
  if (!fs.statSync(filename).isFile()) return false;
  return true;
}

// Every test receives a convenience gm chain that starts from the same baseline fixture.
const originalPathName = path.join(dir, 'original.jpg');

function test (imageMagick) {
  return gm(originalPathName).options({ imageMagick });
}

// Wrap the per-file callback so the harness can report which test module failed before throwing.
function finish (filename) {
  return function (err) {
    if (err) {
      console.error('\n\nError occured with file: ' + filename);
      throw err;
    }
  }
}

// Probe the GraphicsMagick binary. When present, each test file will be replayed against it.
function isGraphicsMagickInstalled() {
  try {
    cp.execSync('gm -version');
    return true;
  } catch (_) {
    return false;
  }
}

// Probe the legacy ImageMagick entrypoint. This is skipped on Windows because `convert`
// resolves to a different built-in command there.
function isConvertInstalled() {
  try {
    cp.execSync('convert -version');
    return true;
  } catch (_) {
    return false;
  }
}

// Probe the ImageMagick 7+ `magick` entrypoint so the suite can exercise modern installs as well.
function isMagickInstalled() {
  try {
    cp.execSync('magick -version');
    return true;
  } catch (_) {
    return false;
  }
}

const isWindows = () => os.platform() === 'win32';

// Run tests serially to keep temporary output names, shared fixtures, and log output easy to follow.
var q = Async.queue(function (task, callback) {
  var filename = task.filename;
  var im = task.imagemagick;

  console.log(`Testing ${filename} ..`);
  require(filename)(test(im), dir, function (err) {
    finish(filename)(err);
    callback();
  }, gm, im);
}, 1);

q.drain = function(){
  console.log("\n\u001B[32mAll tests passed\u001B[0m");
};

// Resolve absolute paths up front so the queue can `require()` each test module directly.
files = files.map(function (file) {
  return path.join(__dirname, file);
});

if (isGraphicsMagickInstalled()) {
  console.log('gm is installed');
  // Schedule one pass that uses the GraphicsMagick-compatible command builder.
  files.forEach(function (filename) {
    q.push({
      imagemagick: false,
      filename
    })
  });
}

if (!isWindows() && isConvertInstalled()) {
  // windows has a different convert binary

  console.log('convert is installed');
  // Schedule one pass that uses the legacy ImageMagick `convert` executable.
  files.forEach(function (filename) {
    q.push({
      imagemagick: true,
      filename
    })
  });
}

if (isMagickInstalled()) {
  console.log('magick is installed');

  // Schedule one pass that uses the ImageMagick 7+ `magick` entrypoint.
  files.forEach(function (filename) {
    q.push({
      imagemagick: '7+',
      filename
    })
  });
}
