/*global dust*/
describe ('Render', function() {
  for (var index = 0; index < coreTests.length; index++) {
    for (var i = 0; i < coreTests[index].tests.length; i++) {
      var test = coreTests[index].tests[i];
      it (test.message, render(test));
    }
  }
});
describe ('Stream', function() {
  for (var index = 0; index < coreTests.length; index++) {
    for (var i = 0; i < coreTests[index].tests.length; i++) {
      var test = coreTests[index].tests[i];
      it (test.message, stream(test));
    }
  }
});
describe ('Pipe', function() {
  for (var index = 0; index < coreTests.length; index++) {
    for (var i = 0; i < coreTests[index].tests.length; i++) {
      var test = coreTests[index].tests[i];
      it (test.message, pipe(test));
    }
  }
});

// Absorb all logs into a log queue for testing purposes
var dustLog = dust.log;
dust.logQueue = [];
dust.log = function(msg, type) {
  dust.logQueue.push({ message: msg, type: type });
  dustLog.call(this, msg, type);
};

function render(test) {
  return function(done) {
    var messageInLog = false;
    var context;
    try {
      dust.config = test.config || { whitespace: false };
      dust.loadSource(dust.compile(test.source, test.name, test.strip));
      context = test.context;
      if (test.base) {
        context = dust.makeBase(test.base).push(context);
      }
      dust.render(test.name, context, function(err, output) {
        var log = dust.logQueue;
        if (test.error) {
          err = err.message || err;
          expect(err).toContain(test.error);
        } else {
          if(err) {
            expect(err.message).toBeNull();
          }
        }
        if (test.log) {
          for(var i=0; i<log.length; i++) {
            if(log[i].message === test.log) {
              messageInLog = true;
              break;
            }
          }
          expect(messageInLog).toEqual(true);
        }
        if (typeof test.expected !== "undefined") {
          expect(test.expected).toEqual(output);
        }
        done();
      });
    }
    catch (error) {
      expect(test.error || {} ).toEqual(error.message);
      done();
    }
  };
}

function stream(test) {
  return function(done) {
    var output = '',
        messageInLog = false,
        log,
        context;
      output = '';
      log = [];

      function check() {
        if (test.error) {
          expect(output).toContain(test.error);
        }
        if (test.log) {
          for(var i=0; i<log.length; i++) {
            if(log[i].message === test.log) {
              messageInLog = true;
              break;
            }
          }
          dust.logQueue = [];
          expect(messageInLog).toEqual(true);
        }
        if (typeof test.expected !== 'undefined') {
          expect(test.expected).toEqual(output);
        }
        done();
      }

      try {
        dust.config = test.config || { whitespace: false };
        dust.loadSource(dust.compile(test.source, test.name));
        context = test.context;
        if (test.base){
           context = dust.makeBase(test.base).push(context);
        }
        // redefine dust.nextTick try catches within async functions to test the error message
        dust.nextTick = (function() {
          if (typeof process !== 'undefined') {
            return function(callback) {
              process.nextTick(function() {
                try {
                  callback();
                } catch(error) {
                  output = error.message;
                  flag = true;
                }
              });
            };
          } else {
            return function(callback) {
              setTimeout(function() {
                try {
                  callback();
                } catch(error) {
                  output = error.message;
                  flag = true;
                }
              },0);
            };
          }
        }());
        dust.stream(test.name, context)
        .on('data', function(data) {
          output += data;
          log = dust.logQueue;
        })
        .on('end', function() {
          log = dust.logQueue;
          check();
        })
        .on('error', function(err) {
          output = err.message || err;
          log = dust.logQueue;
          check();
        });
      } catch(error) {
        output = error.message;
        check();
      }


  }
};

function pipe(test) {
  return function(done) {
    var output, outputTwo, flagOne, flagTwo, complete, context, log, logTwo, messageInLog, messageInLogTwo;
      flagOne = false;
      flagTwo = false;
      complete = false;
      output = '';
      outputTwo = '';
      log = [];
      logTwo = [];
      messageInLog = false;
      messageInLogTwo = false;

      function check(flagNum) {
        if (flagNum === 1) {
          flagOne = true;
        }
        if (flagNum === 2) {
          flagTwo = true;
        }
        if (flagOne && flagTwo && !complete) {
          complete = true;
          if (test.error) {
            expect(output).toContain(test.error);
            expect(outputTwo).toContain(test.error);
          } else if (test.log) {
            for(var i=0; i<log.length; i++) {
              if(log[i].message === test.log) {
                messageInLog = true;
                break;
              }
            }
            dust.logQueue = [];
            expect(messageInLog).toEqual(true);
            for(var i=0; i<logTwo.length; i++) {
              if(logTwo[i].message === test.log) {
                messageInLogTwo = true;
                break;
              }
            }
            dust.logQueue = [];
            expect(messageInLogTwo).toEqual(true);
          }
          if(typeof test.expected !== 'undefined'){
            expect(test.expected).toEqual(output);
            expect(test.expected).toEqual(outputTwo);
          }
          done();
        }
      }

      try {
        dust.config = test.config || { whitespace: false };
        dust.loadSource(dust.compile(test.source, test.name));
        context = test.context;
        if (test.base){
           context = dust.makeBase(test.base).push(context);
        }
        // redefine dust.nextTick try catches within async functions to test the error message
        dust.nextTick = (function() {
          if (typeof process !== 'undefined') {
            return function(callback) {
              process.nextTick(function() {
                try {
                  callback();
                } catch(error) {
                  output = error.message;
                  outputTwo = error.message;
                  check(1);
                  check(2);
                }
              });
            };
          } else {
            return function(callback) {
              setTimeout(function() {
                try {
                  callback();
                } catch(error) {
                  output = error.message;
                  outputTwo = error.message;
                  check(1);
                  check(2);
                }
              }, 0);
            };
          }
        }());
        var tpl = dust.stream(test.name, context);
        tpl.pipe({
          write: function (data) {
            output += data;
            log = dust.logQueue;
          },
          end: function () {
            log = dust.logQueue;
            check(1);
          },
          error: function (err) {
            output = err.message || err;
            log = dust.logQueue;
            check(1);
          }
        });
        // Pipe to a second stream to test multiple event-listeners
        tpl.pipe({
          write: function (data) {
            outputTwo += data;
            logTwo = logTwo.concat(dust.logQueue);
          },
          end: function () {
            logTwo = logTwo.concat(dust.logQueue);
            check(2);
          },
          error: function (err) {
            outputTwo = err.message || err;
            logTwo = logTwo.concat(dust.logQueue);
            check(2);
          }
        });
      } catch(error) {
        output = error.message;
        outputTwo = error.message;
        check(1);
        check(2);
      }
  }
};
