var uutest    = require('../../test/uutest'),
    dust      = require('dustjs-linkedin'),
    tests     = require('./jasmine-test/spec/helpersTests'),
    coreSetup = require('../../test/core').coreSetup;

dust.helpers = require('../lib/dust-helpers').helpers;

//Add the tapper helper to test the Tap helper.
dust.helpers.tapper = function(chunk, context, bodies, params) {
  var result = dust.helpers.tap(params.value,chunk,context); 
  chunk.write(result); 
  return chunk;
};

function dumpError(err) {
  var out = err.testName + " -> ";
  if (!err.message) {
    err.message = JSON.stringify(err.expected)
      + " " + err.operator + " " + JSON.stringify(err.actual);
  }
  return out + err.stack;
}

var suite = new uutest.Suite({
  pass: function() {
    process.stdout.write(".");
  },
  fail: function(err) {
    process.stdout.write("F");
  },
  done: function(passed, failed, elapsed) {
    process.stdout.write("\n");
    console.log(passed + " passed " + failed + " failed " + "(" + elapsed + "ms)");
    this.errors.forEach(function(err) {
      console.log(dumpError(err));
    });
  }
});

global.dust = dust;

coreSetup(suite, tests);

suite.run();