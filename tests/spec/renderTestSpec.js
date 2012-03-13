describe ("Test the basic functionality of dust", function() {
  for (var index = 0; index < dustExamples.length; index++) {
    var test = dustExamples[index];
    it (test.message, render(test));
  };
});

function render(test) { 
  return function() {
    try {
      dust.loadSource(dust.compile(test.source, test.name));
      dust.render(test.name, test.context, function(err, output) {
        expect(err).toBeNull();
        expect(output).toEqual(test.expected);
      });
    }
    catch (error) {
      expect(error).toEqual(test.error || {} );
    }
  };
}