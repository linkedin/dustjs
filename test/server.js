var uutest    = require('./uutest'),
    dust      = require('../lib/dust'),
    tests     = require('./examples').dustExamples,
    coreSetup = require('./core').coreSetup;

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

coreSetup(suite, tests.slice(1));

suite.run();