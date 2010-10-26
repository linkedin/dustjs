(function(exports){

exports.coreSetup = function(suite, auto, dust) {
  auto.forEach(function(test) {
    var name = test.name;

    suite.test(name, function(){
      var unit = this;
      dust.loadSource(dust.compile(test.source, name));
      dust.render(name, test.context, function(err, output) {
        try {
          unit.ifError(err);
          unit.equals(output, test.expected);
        } catch(err) {
          unit.fail(err);
          return;
        }
        unit.pass();
      });
    });
  });
}

})(typeof exports !== "undefined" ? exports : window);