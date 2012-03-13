describe ("Test the basic functionality of dust", function() {
  for (index in dustExamples) {
    var test = dustExamples[index];
    it (test.message, function() {
      try {
        dust.loadSource(dust.compile(test.source, test.name));
        dust.render(test.name, test.context, function(err, output) {
          expect(err).toBeNull();
          expect(output).toEqual(test.expected);
        });
      } 
      catch (error) {
        expect(error.message).toEqual(test.errorExpected);
      } 
    });
  };
});