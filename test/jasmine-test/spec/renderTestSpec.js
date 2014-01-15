describe ('Test the basic functionality of dust', function() {
  for (var index = 0; index < coreTests.length; index++) {
    for (var i = 0; i < coreTests[index].tests.length; i++) {
      var test = coreTests[index].tests[i];
      it ('RENDER: ' + test.message, render(test));
      it ('STREAM: ' + test.message, stream(test));
      it ('PIPE: ' + test.message, pipe(test));
    }
  };
});

function render(test) {
  var messageInLog = false;
  return function() {
    var context;
    try {
      dust.isDebug = !!(test.error || test.log);
      dust.debugLevel = 'DEBUG';
      dust.loadSource(dust.compile(test.source, test.name, test.strip));
      context = test.context;
      if (test.base) {
        context = dust.makeBase(test.base).push(context);
      }
      dust.render(test.name, context, function(err, output) {
        var log = dust.logQueue;
        expect(err).toBeNull();
        if (test.log) {
          for(var i=0; i<log.length; i++) {
            if(log[i].message === test.log) {
              messageInLog = true;
              break;
            }
          }
          dust.logQueue = [];
          expect(messageInLog).toEqual(true);
        } else {
          expect(test.expected).toEqual(output);
        }
      });
    }
    catch (error) {
      expect(test.error || {} ).toEqual(error.message);
    }
  };
}

function stream(test) {
  return function() {
    var output = '',
        messageInLog = false,
        log,
        flag,
        context;
    runs(function(){
      flag = false;
      output = '';
      log = [];
      try {
        dust.isDebug = !!(test.error || test.log);
        dust.debugLevel = 'DEBUG';
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
        } )();
        dust.stream(test.name, context)
        .on('data', function(data) {
          output += data;
          log = dust.logQueue;
        })
        .on('end', function() {
          flag = true;
          log = dust.logQueue;
        })
        .on('error', function(err) {
          output = err.message;
          log = dust.logQueue;
        })
      } catch(error) {
        output = error.message;
        flag= true;
      }
    });

    waitsFor(function(){
      return flag;
    }, 'the output', 500);

    runs(function(){
      if (test.error) {
        expect(test.error || {} ).toEqual(output);
      } else if(test.log) {
        for(var i=0; i<log.length; i++) {
          if(log[i].message === test.log) {
            messageInLog = true;
            break;
          }
        }
        dust.logQueue = [];
        expect(messageInLog).toEqual(true);
      } else {
        expect(test.expected).toEqual(output);
      }
    });
  }
};

function pipe(test) {
  return function() {
    var output, outputTwo, flag, flagTwo, context, log, logTwo, messageInLog, messageInLogTwo;
    runs(function() {
      flag = false;
      flagTwo = false;
      output = '';
      outputTwo = '';
      log = [];
      logTwo = [];
      messageInLog = false;
      messageInLogTwo = false;
      try {
        dust.isDebug = !!(test.error || test.log);
        dust.debugLevel = 'DEBUG';
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
                  flag = true;
                  flagTwo = true;
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
                  flag = true;
                  flagTwo = true;
                }
              }, 0);
            };
          }
        } )();
        var tpl = dust.stream(test.name, context);
        tpl.pipe({
          write: function (data) {
            output += data;
            log = dust.logQueue;
          },
          end: function () {
            flag = true;
            log = dust.logQueue;
          },
          error: function (err) {
            flag = true;
            output = err.message;
            log = dust.logQueue;
          }
        });
        // Pipe to a second stream to test multiple event-listeners
        tpl.pipe({
          write: function (data) {
            outputTwo += data;
            logTwo = logTwo.concat(dust.logQueue);
          },
          end: function () {
            flagTwo = true;
            logTwo = logTwo.concat(dust.logQueue);
          },
          error: function (err) {
            flagTwo = true;
            outputTwo = err.message;
            logTwo = logTwo.concat(dust.logQueue);
          }
        });
      } catch(error) {
        output = error.message;
        outputTwo = error.message;
        flag= true;
        flagTwo= true;
      }
    });

    waitsFor(function(){
      return flag && flagTwo;
    }, 'the output', 500);

    runs(function(){
      if (test.error) {
        expect(test.error || {} ).toEqual(output);
        expect(test.error || {} ).toEqual(outputTwo);
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
      } else {
        expect(test.expected).toEqual(output);
        expect(test.expected).toEqual(outputTwo);
      }
    });
  }
};
