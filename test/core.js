(function(exports){

exports.coreSetup = function(suite, auto) {
  auto.forEach(function(test) {
    suite.test(test.name, function(){
      testRender(this, test.source, test.context, test.expected, test.options, test.base, test.error || {}, test.log);
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

  suite.test("compileFn", function() {
    var unit = this,
        tmpl = dust.compileFn('Hello World');
    tmpl({}, function(err, out) {
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

  suite.test("renderSource (multipe listeners)", function() {
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

  suite.test("indexInArray", function() {
    var unit = this,
        arr = ["hello", "world"],
        nativeIndexOf = Array.prototype.indexOf,
        indexOf;
    indexOf = dust.indexInArray(arr, "world");
    unit.equals(indexOf, 1);
    indexOf = dust.indexInArray(arr, "foo");
    unit.equals(indexOf, -1);
    Array.prototype.indexOf = undefined;
    // test indexOf when the array indexOf function is undefined (IE lte 8)
    indexOf = dust.indexInArray(arr, "world");
    unit.equals(indexOf, 1);
    indexOf = dust.indexInArray(arr, "foo");
    unit.equals(indexOf, -1);
    Array.prototype.indexOf = nativeIndexOf;
    unit.notEquals(Array.prototype.indexOf, undefined);
    unit.pass();
  });
}

function testRender(unit, source, context, expected, options, baseContext, error, logMessage) {
  var name = unit.id,
      messageInLog = '';
   try {
     dust.isDebug = !!(error || logMessage);
     dust.debugLevel = 'DEBUG';
     dust.loadSource(dust.compile(source, name));
     if (baseContext){
        context = dust.makeBase(baseContext).push(context);
     }
     dust.render(name, context, function(err, output) {
      var log = dust.logQueue;
       unit.ifError(err);
       if(logMessage) {
        for(var i=0; i<log.length; i++) {
          if(log[i].message === logMessage) {
            messageInLog = true;
            break;
          }
        }
        dust.logQueue = [];
        unit.equals(messageInLog, true);
       } else {
        unit.equals(output, expected);
       }
     });
    } catch(err) {
      unit.equals(err.message || err, error);
    }
    unit.pass();
};

})(typeof exports !== "undefined" ? exports : window);
