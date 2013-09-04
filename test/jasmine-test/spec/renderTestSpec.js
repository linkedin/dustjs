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
  return function() {
    var context;
    try {
      dust.loadSource(dust.compile(test.source, test.name, test.strip));
      context = test.context;
      if (test.base) {
        context = dust.makeBase(test.base).push(context);
      }
      dust.render(test.name, context, function(err, output) {
        expect(err).toBeNull();
        expect(test.expected).toEqual(output);
      });
    }
    catch (error) {
      expect(test.error || {} ).toEqual(error.message);
    }
  };
}

function stream(test) {
  return function() {
    var output ="", flag, context;
    runs(function(){
      flag = false;
      output = "";
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
      } else {
        expect(test.expected).toEqual(output);
      }
    });
  }
};

function pipe(test) {
  return function() {
    var output, outputTwo, flag, flagTwo, context;
    runs(function(){
      flag = false;
      flagTwo = false;
      output = "";
      outputTwo = "";
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
      } else {
        expect(test.expected).toEqual(output);
        expect(test.expected).toEqual(outputTwo);
      }
    });
  }
};
