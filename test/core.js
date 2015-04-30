(function(exports){
/*global dust*/
exports.coreSetup = function(suite, auto) {
  auto.forEach(function(test) {
    suite.test(test.name, function(){
      testRender(this, test.source, test.context, test.expected, test.options, test.base, test.error, test.log, test.config);
    });
  });

  suite.test("base context", function() {
    var base = dust.makeBase({
      sayHello: function() { return "Hello!"; },
      names: ["Alice", "Bob", "Dusty"]
    });
    this.equals(base.push().push().push().push().stack, undefined);
    testRender(this, "{sayHello} {foo}", base.push({foo: "bar"}), "Hello! bar");
    testRender(this, "{sayHello} {foo}", dust.makeBase().push({foo: "bar"}), " bar");
    testRender(this, "{sayHello} {foo}", undefined, " ");
    testRender(this, "{sayHello} {#names}{.} {/names}", base, "Hello! Alice Bob Dusty ");
  });

  suite.test("context options", function() {
    var opts = { lang: "fr" },
        globals = { hello: "world" };
    var base = dust.makeBase(globals, opts);
    this.equals(base.options.lang, opts.lang);
    base = base.rebase();
    this.equals(base.options.lang, opts.lang);
    this.pass();
  });

  suite.test("valid keys", function() {
    testRender(this, "{_foo}{$bar}{baz1}", {_foo: 1, $bar: 2, baz1: 3}, "123");
  });

  suite.test("onLoad that calls callback with source", function() {
    var unit = this;
    dust.cache.onLoad = null;
    dust.onLoad = function(name, cb) {
      cb(null, 'Loaded: ' + name + ', template name {templateName}');
    };
    dust.render("onLoad", { templateName: function(chunk, context) { return context.getTemplateName(); } }, function(err, out) {
      try {
        unit.ifError(err);
        unit.equals(out, "Loaded: onLoad, template name onLoad");
      } catch(err) {
        unit.fail(err);
        return;
      }
      unit.pass();
    });
  });

  suite.test('onLoad that returns a compiled template', function() {
    var unit = this;
    dust.cache.onLoad = null;
    dust.onLoad = function(name, cb) {
      var tmpl = dust.loadSource(dust.compile('Loaded: ' + name + ', template name {templateName}', 'foobar'));
      cb(null, tmpl);
    };
    dust.render("onLoad", { templateName: function(chunk, context) { return context.getTemplateName(); } }, function(err, out) {
      try {
        unit.ifError(err);
        unit.equals(out, "Loaded: onLoad, template name foobar");
        unit.equals(dust.cache.onLoad, null);
      } catch(err) {
        unit.fail(err);
        return;
      }
      unit.pass();
    });
  });

  suite.test('onLoad that returns a compiled template; override template name', function() {
    var unit = this;
    dust.cache.onLoad = null;
    dust.onLoad = function(name, cb) {
      var tmpl = dust.loadSource(dust.compile('Loaded: ' + name + ', template name {templateName}', 'foobar'));
      tmpl.templateName = 'override';
      cb(null, dust.cache.foobar);
    };
    dust.render("onLoad", { templateName: function(chunk, context) { return context.getTemplateName(); } }, function(err, out) {
      try {
        unit.ifError(err);
        unit.equals(out, "Loaded: onLoad, template name override");
        unit.equals(dust.cache.onLoad, null);
      } catch(err) {
        unit.fail(err);
        return;
      }
      unit.pass();
    });
  });

  suite.test("onLoad receives context options", function() {
    var unit = this;
    dust.cache.onLoad = null;
    dust.onLoad = function(name, opts, cb) {
      cb(null, 'Loaded: ' + name + ', lang ' + opts.lang);
    };
    dust.render("onLoad", dust.makeBase(null, { lang: "fr" }), function(err, out) {
      try {
        unit.ifError(err);
        unit.equals(out, "Loaded: onLoad, lang fr");
      } catch(err) {
        unit.fail(err);
        return;
      }
      unit.pass();
    });
  });

  suite.test("disable cache", function() {
    var unit = this,
        template = "Version 1";
    dust.onLoad = function(name, cb) {
      cb(null, template);
    };
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

  suite.test("compileFn", function() {
    var unit = this,
        tmpl = dust.compileFn('Hello {world}');
    tmpl({world: "World"}, function(err, out) {
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

  suite.test("compileFn stream", function() {
    var unit = this,
        tmpl = dust.compileFn('Hello {world}');
    tmpl({world: "World"})
    .on('data', function(out) {
      try {
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
    });
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

};

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
