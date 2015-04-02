/*global dust*/
(function(exports){

exports.coreSetup = function(suite, auto) {
  auto.forEach(function(test) {
    suite.test(test.name, function(){
      testRender(this, test.source, test.context, test.expected, test.options, test.base, test.error, test.log, test.config);
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
  suite.test("disable cache", function() {
    var unit = this,
        template = "Version 1",
        cache;
    dust.onLoad = function(name, cb) {
      cb(null, template);
    };
    // Store what's in the cache before we blow it all away
    cache = dust.cache;
    dust.config.cache = false;
    dust.render("test", {}, function(err, out) {
      try {
        unit.equals(out, "Version 1");
        template = "Version 2";
        dust.render("test", {}, function(err, out) {
          try {
            unit.equals(out, "Version 2");
          } catch(err) {
            return unit.fail(err);
          } finally {
            // restore
            dust.cache = cache;
            dust.onLoad = null;
            dust.config.cache = true;
          }
          unit.pass();
        });
      } catch(err) {
        return unit.fail(err);
      }
    });
  });

  suite.test("render a template function", function() {
    var unit = this;
    var source = "Hello World",
        compiledSource = dust.compile(source),
        template = dust.loadSource(compiledSource);
    dust.render(template, {}, function(err, out) {
      try {
        unit.ifError(err);
        unit.equals(out, source);
      } catch(err) {
        unit.fail(err);
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

  suite.test("renderSource (multiple listeners)", function() {
    var unit = this;
    dust.renderSource('Hello World', {}).on('data', function(data) {
      try {
        unit.equals('Hello World', data);
      } catch(err) {
        unit.fail(err);
        return;
      }
    }).on('data', function(data) {
      try {
        unit.equals('Hello World', data);
      } catch(err) {
        unit.fail(err);
        return;
      }
    }).on('end', function() {
      unit.pass();
    }).on('error', function(err) {
      unit.fail(err);
    });
  });

}

function extend(target, donor) {
  donor = donor || {};
  for(var prop in donor) {
    target[prop] = donor[prop];
  }
  return target;
}

function testRender(unit, source, context, expected, options, baseContext, error, logMessage, config) {
  var name = unit.id,
      messageInLog = '';
   try {
     dust.isDebug = !!(error || logMessage);
     dust.config = extend({ whitespace: false, amd: false, cache: true }, config);
     dust.loadSource(dust.compile(source, name));
     if (baseContext){
        context = dust.makeBase(baseContext).push(context);
     }
     dust.render(name, context, function(err, output) {
      try {
        var log = dust.logQueue;
         if(error) {
          unit.contains(error, err.message || err);
         } else {
          unit.ifError(err);
         }
         if(logMessage) {
          for(var i=0; i<log.length; i++) {
            if(log[i].message === logMessage) {
              messageInLog = true;
              break;
            }
          }
          dust.logQueue = [];
          unit.equals(messageInLog, true);
         }
         if(typeof expected !== 'undefined'){
          unit.equals(output, expected);
         }
       } catch(err) {
         unit.fail(err);
       }
       unit.pass();
     });
    } catch(err) {
      if(error) {
        unit.contains(error, err.message || err);
        unit.pass();
      } else {
        unit.fail(err);
      }
    }
};

})(typeof exports !== "undefined" ? exports : window);
