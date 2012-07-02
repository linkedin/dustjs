(function(exports){

exports.coreSetup = function(suite, auto) {
  auto.forEach(function(test) {
    suite.test(test.name, function(){
      testRender(this, test.source, test.context, test.expected, test.error || {});
    });
  });

  suite.test("base context", function() {
    var base = dust.makeBase({
      sayHello: function() { return "Hello!" }
    });
    testRender(this, "{sayHello} {foo}", base.push({foo: "bar"}), "Hello! bar");
  });

  suite.test("valid keys", function() {
    testRender(this, "{_foo}{$bar}{baz1}", {_foo: 1, $bar: 2, baz1: 3}, "123");
  });

  suite.test("onLoad callback", function() {
    var unit = this;
    dust.onLoad = function(name, cb) {
      cb(null, "Loaded: " + name);
    };
    dust.render("onLoad", {}, function(err, out) {
      try {
        unit.ifError(err);
        unit.equals(out, "Loaded: onLoad");
      } catch(err) {
        unit.fail(err);
        return;
      }
      unit.pass();
    });
  });

  suite.test("renderSource (callback)", function() {
    var unit = this;
    dust.renderSource('Hello World', {}, function(err, out) {
      try {
        unit.ifError(err);
        unit.equals(out, "Hello World");
      } catch(err) {
        unit.fail(err);
        return;
      }
      unit.pass();
    });
  });

  suite.test("renderSource (stream)", function() {
    var unit = this;
    dust.renderSource('Hello World', {}).on('data', function(data) {
      try {
        unit.equals('Hello World', data);
      } catch(err) {
        unit.fail(err);
        return;
      }
      unit.pass();
    }).on('error', function(err) {
      unit.fail(err);
    });
  });

  suite.test("renderSource (pipe)", function() {
    var unit = this;
    dust.renderSource('Hello World', {}).pipe({
      write: function (data) {
        try {
          unit.equals('Hello World', data);
        } catch(err) {
          unit.fail(err);
          return;
        }
      },
      end: function () {
        unit.pass();
      }
    })
  });
}

function testRender(unit, source, context, expected, error) {
  var name = unit.id;
   try {
     dust.loadSource(dust.compile(source, name));
     dust.render(name, context, function(err, output) {
       unit.ifError(err);
       unit.equals(output, expected);
     });
    } catch(err) {
      unit.equals(err.message, error);
    }
    unit.pass();
};

})(typeof exports !== "undefined" ? exports : window);