describe ("Test the basic functionality of dust", function() {
  for (var index = 0; index < dustExamples.length; index++) {
    var test = dustExamples[index];
    it ("RENDER: " + test.message, render(test));
    it ("STREAM: " + test.message, stream(test));
    it ("PIPE: " + test.message, pipe(test));
  };
});

function render(test) {
  return function() {
    try {
      dust.loadSource(dust.compile(test.source, test.name));
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

function stream(test) {
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

function pipe(test) {
  return function() {
    var output, flag;
    runs(function(){
      flag = false;
      output = "";
      try {
        dust.loadSource(dust.compile(test.source, test.name));
        dust.stream(test.name, test.context).pipe({
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