var testVersion = '1.2.4';
// Ideally the above value should be loaded from package.json but it is out of the scope of this page
//	Also using the require text plugin caused problems with Jasmine  
//	Alternately the line could be modified by the build process

var dustAMD = {}

require(['../../../dist/dust-full-' + testVersion], function(dust){
	
	dustAMD = dust;
	describe ("Test the basic functionality of dust with require", function() {
	  for (var index = 0; index < coreTests.length; index++) {
	    for (var i = 0; i < coreTests[index].tests.length; i++) {
	      var test = coreTests[index].tests[i];
	      it ("RENDER: " + test.message, render(test, dust));
	      it ("STREAM: " + test.message, stream(test, dust));
	      it ("PIPE: " + test.message, pipe(test, dust));
	    }
	  };
	});
});


function render(test, dust) {
  return function() {
    try {
      dust.loadSource(dust.compile(test.source, test.name, test.strip));
      dust.render(test.name, test.context, function(err, output) {
        expect(err).toBeNull();
        expect(test.expected).toEqual(output);
      });
    }
    catch (error) {
      expect(test.error || {} ).toEqual(error.message);
    }
  };
}

function stream(test, dust) {
  return function() {
    var output ="", flag;
    runs(function(){
      flag = false;
      output = "";
      try {
        dust.loadSource(dust.compile(test.source, test.name));
        dust.stream(test.name, test.context)
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

function pipe(test, dust) {
  return function() {
    var output, outputTwo, flag, flagTwo;
    runs(function(){
      flag = false;
      flagTwo = false;
      output = "";
      outputTwo = "";
      try {
        dust.loadSource(dust.compile(test.source, test.name));
        var tpl = dust.stream(test.name, test.context);
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
