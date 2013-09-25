describe ("Test the basic functionality of dust", function() {
  for (var index = 0; index < coreTests.length; index++) {
    for (var i = 0; i < coreTests[index].tests.length; i++) {
      var test = coreTests[index].tests[i];
      it ("RENDER: " + test.message, render(test));
      it ("STREAM: " + test.message, stream(test));
      it ("PIPE: " + test.message, pipe(test));
    }
  };
});

function render(test) {
  var messageInLog = false;
  return function() {
    var context;
    try {
      dust.loadSource(dust.compile(test.source, test.name, test.strip));
      context = test.context;
      if (test.base) {
        context = dust.makeBase(test.base).push(context);
      }
      dust.render(test.name, context, function(err, output, log) {
        expect(err).toBeNull();
        if (test.log) {
          for(var i=0; i<log.length; i++) {
            if(log[i].message === test.log) {
              messageInLog = true;
              break;
            }
          }
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
    var output = "",
        messageInLog = false,
        log = [],
        flag,
        context;
    runs(function(){
      flag = false;
      output = "";
      logQueue = [];
      try {
        dust.loadSource(dust.compile(test.source, test.name));
        context = test.context;
        if (test.base){
           context = dust.makeBase(test.base).push(context);
        }
        dust.stream(test.name, context)
        .on("data", function(data) {
          output += data;
        })
        .on("end", function() {
          flag = true;
        })
        .on("error", function(err) {
          output = err.message;
        })
        .on("log", function(logs) {
          logQueue = logs;
        });
      } catch(error) {
        output = error.message;
        flag= true;
      }
    });
    
    waitsFor(function(){
      return flag;
    }, "the output", 500);
    
    runs(function(){
      if (test.error) {
        expect(test.error || {} ).toEqual(output);
      } else if(test.log) {
        for(var i=0; i<logQueue.length; i++) {
          if(logQueue[i].message === test.log) {
            messageInLog = true;
            break;
          }
        }
        expect(messageInLog).toEqual(true);
      } else {
        expect(test.expected).toEqual(output);
      }
    });
  }
};

function pipe(test) {
  return function() {
    var output, outputTwo, flag, flagTwo, context, logQueue, logQueueTwo, messageInLog, messageInLogTwo;
    runs(function(){
      flag = false;
      flagTwo = false;
      output = "";
      outputTwo = "";
      logQueue = [];
      logQueueTwo = [];
      messageInLog = false;
      messageInLogTwo = false;
      try {
        dust.loadSource(dust.compile(test.source, test.name));
        context = test.context;
        if (test.base){
           context = dust.makeBase(test.base).push(context);
        }
        var tpl = dust.stream(test.name, context);
        tpl.pipe({
          write: function (data) {
            output += data;
          },
          end: function () {
            flag = true;
          },
          error: function (err) {
            flag = true;
            output = err.message;
          },
          log: function(logs) {
            logQueue = logs;
          }
        });
        // Pipe to a second stream to test multiple event-listeners
        tpl.pipe({
          write: function (data) {
            outputTwo += data;
          },
          end: function () {
            flagTwo = true;
          },
          error: function (err) {
            flagTwo = true;
            outputTwo = err.message;
          },
          log: function(logs) {
            logQueueTwo = logs;
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
    }, "the output", 500);
    
    runs(function(){
      if (test.error) {
        expect(test.error || {} ).toEqual(output);
        expect(test.error || {} ).toEqual(outputTwo);
      } else if (test.log) { 
        for(var i=0; i<logQueue.length; i++) {
          if(logQueue[i].message === test.log) {
            messageInLog = true;
            break;
          }
        }
        expect(messageInLog).toEqual(true);
        for(var i=0; i<logQueueTwo.length; i++) {
          if(logQueueTwo[i].message === test.log) {
            messageInLogTwo = true;
            break;
          }
        }
        expect(messageInLogTwo).toEqual(true);
      } else {
        expect(test.expected).toEqual(output);
        expect(test.expected).toEqual(outputTwo);
      }
    });
  }
};
