(function(exports){

exports.coreSetup = function(suite, auto) {
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

  suite.test("base context", function() {
    var unit = this;
    var base = dust.makeBase({
      sayHello: function() { return "Hello!" }
    });

    dust.loadSource(dust.compile("{sayHello} {foo}", "base_context"));
    dust.render("base_context", base.push({foo: "bar"}), function(err, out) {
      try {
        unit.ifError(err);
        unit.equals(out, "Hello! bar");
      } catch(err) {
        unit.fail(err);
        return;
      }
      unit.pass();
    });
  });
}

})(typeof exports !== "undefined" ? exports : window);