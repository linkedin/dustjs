/*global global, process, console */
var uutest    = require('./uutest'),
    coreTests     = require('./jasmine-test/spec/coreTests'),
    coreSetup = require('./core').coreSetup;

var dust = require('..');

// load additional helpers used in testing
require('./jasmine-test/spec/testHelpers');

// Absorb all logs into a log queue for testing purposes
var dustLog = dust.log;
dust.logQueue = [];
dust.log = function(msg, type) {
  dust.logQueue.push({ message: msg, type: type });
  dustLog.call(this, msg, type);
};

function dumpError(err) {
  var out = err.testName + ' -> ';
  if (!err.message) {
    err.message = JSON.stringify(err.expected) +
      ' ' + err.operator + ' ' + JSON.stringify(err.actual);
  }
  return out + err.stack;
}

for (var i=0; i<coreTests.length; i++) {
  var suite = new uutest.Suite({
    pass: function() {
      process.stdout.write('.');
    },
    fail: function(err) {
      process.stdout.write("F");
    },
    done: function(passed, failed, elapsed) {
      this.errors.forEach(function(err) {
        console.log(dumpError(err));
        process.exit(1);
      });
    }
  });

  global.dust = dust;

  coreSetup(suite, coreTests[i].tests);

  suite.run();
}
