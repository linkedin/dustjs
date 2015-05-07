(function (root, factory) {
  if (typeof exports === 'object') {
    factory(require('../'));
  } else {
    factory(root.dust);
  }
}(this, function(dust) {

  function extend(target, donor) {
    donor = donor || {};
    for(var prop in donor) {
      target[prop] = donor[prop];
    }
    return target;
  }

  function renderIt(message, source, context, expected, config) {
    var tmpl = dust.loadSource(dust.compile(source));
    dust.config = extend({ whitespace: false, amd: false, cjs: false, cache: true }, config);
    it(message, function(done) {
      render(tmpl, context, expected, done);
    });
  }

  function render(tmpl, context, expected, done) {
    dust.render(tmpl, context, function(err, output) {
      expect(err).toBe(null);
      expect(output).toEqual(expected);
      done();
    });
  }

  describe('Context', function() {
    describe("render", function() {
      var base = dust.makeBase({
        sayHello: function() { return "Hello!"; },
        names: ["Alice", "Bob", "Dusty"]
      });
      it("doesn't push onto the stack if data is undefined", function() {
        expect(base.push().push().push().push().stack).toBe(undefined);
      });
      renderIt("can read from both globals and context", "{sayHello} {foo}", base.push({foo: "bar"}), "Hello! bar");
      renderIt("doesn't error if globals are empty", "{sayHello} {foo}", dust.makeBase().push({foo: "bar"}), " bar");
      renderIt("doesn't error if context is undefined", "{sayHello} {foo}", undefined, " ");
      renderIt("can iterate over an array in the globals", "{sayHello} {#names}{.} {/names}", base, "Hello! Alice Bob Dusty ");
    });

    describe('options', function() {
      it('sets options using makeBase / context', function() {
        var opts = { lang: "fr" },
            globals = { hello: "world" };
        var base = dust.context(globals, opts);
        expect(base.options.lang).toEqual(opts.lang);
        base = base.rebase();
        expect(base.options.lang).toEqual(opts.lang);
      });
    });
  });

  it("valid keys", function() {
    renderIt("Renders all valid keys", "{_foo}{$bar}{baz1}", {_foo: 1, $bar: 2, baz1: 3}, "123");
  });

  describe('dust.onLoad', function() {
    beforeEach(function() {
      dust.cache.onLoad = null;
    });
    it("calls callback with source", function(done) {
      dust.onLoad = function(name, cb) {
        cb(null, 'Loaded: ' + name + ', template name {templateName}');
      };
      render("onLoad", {
        templateName: function(chunk, context) {
          return context.getTemplateName();
        }
      }, "Loaded: onLoad, template name onLoad", done);
    });
    it("calls callback with compiled template", function(done) {
      dust.onLoad = function(name, cb) {
        var tmpl = dust.loadSource(dust.compile('Loaded: ' + name + ', template name {templateName}', 'foobar'));
        cb(null, tmpl);
      };
      render("onLoad", {
        templateName: function(chunk, context) {
          return context.getTemplateName();
        }
      }, "Loaded: onLoad, template name foobar", done);
    });
    it("calls callback with compiled template and can override template name", function(done) {
      dust.onLoad = function(name, cb) {
        var tmpl = dust.loadSource(dust.compile('Loaded: ' + name + ', template name {templateName}', 'foobar'));
        tmpl.templateName = 'override';
        cb(null, dust.cache.foobar);
      };
      render("onLoad", {
        templateName: function(chunk, context) {
          return context.getTemplateName();
        }
      }, "Loaded: onLoad, template name override", done);
    });
    it("receives context options", function(done) {
      dust.onLoad = function(name, opts, cb) {
        cb(null, 'Loaded: ' + name + ', lang ' + opts.lang);
      };
      render("onLoad", dust.makeBase(null, { lang: "fr" }), "Loaded: onLoad, lang fr", done);
    });
  });

  describe('dust.config.cache', function() {
    beforeAll(function() {
      dust.config.cache = false;
    });
    afterAll(function() {
      dust.config.cache = true;
    });
    it('turns off cache registration', function() {
      dust.loadSource(dust.compile('Not cached', 'test'));
      expect(dust.cache.test).toBe(undefined);
    });
    it('calls onLoad every time for a template', function(done) {
      var tmpl = "Version 1";
      dust.onLoad = function(name, cb) {
        cb(null, tmpl);
      };
      dust.render('test', undefined, function(err, out) {
        expect(out).toEqual(tmpl);
        tmpl = "Version 2";
        dust.render('test', undefined, function(err, out) {
          expect(out).toEqual(tmpl);
          done();
        });
      });
    });
    it('does not clobber a cached template', function() {
      dust.cache.test = 'test';
      dust.loadSource(dust.compile('Not cached', 'test'));
      expect(dust.cache.test).toEqual('test');
    });
  });

  describe('renderSource', function() {
    var template = "Hello {world}!",
        expected = "Hello world!",
        ctx = {world: "world"};

    it('invokes a callback', function(done) {
      dust.renderSource(template, ctx, function(err, out) {
        expect(err).toBe(null);
        expect(out).toBe(expected);
        done();
      });
    });

    it('streams', function(done) {
      dust.renderSource(template, ctx).on('data', function(out) {
        expect(out).toBe(expected);
        done();
      });
    });

    it('streams to every listener', function(done) {
      var recipients = 0;
      var stream = dust.renderSource(template, ctx);
      var func = function(out) {
        expect(out).toBe(expected);
        recipients--;
      };

      while(recipients < 10) {
        stream.on('data', func);
        recipients++;
      }

      stream.on('end', function() {
        expect(recipients).toBe(0);
        done();
      });
    });

    it('pipes', function(done) {
      var gotData = false;
      dust.renderSource(template, ctx).pipe({
        write: function(out) {
          expect(out).toBe(expected);
          gotData = true;
        },
        end: function() {
          expect(gotData).toBe(true);
          done();
        }
      });
    });
  });

  describe('compileFn', function() {
    var ctx = {world:"World"},
        expected = 'Hello World',
        tmpl;
    beforeAll(function() {
      tmpl = dust.compileFn('Hello {world}');
    });
    it('can be invoked as a function', function(done) {
      tmpl(ctx, function(err, out) {
        expect(out).toEqual(expected);
        done();
      });
    });
    it('emits events like a stream', function(done) {
      tmpl(ctx).on('data', function(out) {
        expect(out).toEqual(expected);
        done();
      });
    });
  });

}));
