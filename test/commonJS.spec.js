var dust = require('../');

function load(tmpl, name) {
  /*jshint evil:true*/
  return eval(dust.compile(tmpl, name))(dust);
}

describe('CommonJS template', function() {
  var template = "Hello {world}!",
      context = { world: "world" },
      rendered = "Hello world!",
      tmpl;

  beforeAll(function() {
    dust.config.cjs = true;
    dust.cache = {};
  });

  afterAll(function() {
    dust.config.cjs = false;
  });

  beforeEach(function() {
    tmpl = load(template, 'hello');
    dust.onLoad = undefined;
  });

  it('can be invoked to render', function() {
    tmpl(context, function(err, out) {
      expect(out).toEqual(rendered);
    });
  });

  it('can be invoked to stream', function(done) {
    tmpl(context).on('data', function(out) {
      expect(out).toEqual(rendered);
      done();
    });
  });

  it('can be passed to dust.render', function() {
    dust.render(tmpl, context, function(err, out) {
      expect(out).toEqual(rendered);
    });
  });

  it('can be passed to dust.stream', function(done) {
    dust.stream(tmpl, context).on('data', function(out) {
      expect(out).toEqual(rendered);
      done();
    });
  });

  it('has a template property that can be passed to dust.render', function() {
    dust.render(tmpl.template, context, function(err, out) {
      expect(out).toEqual(rendered);
    });
  });

  it('has a name that can be passed to dust.render', function() {
    dust.render(tmpl.template.templateName, context, function(err, out) {
      expect(out).toEqual(rendered);
    });
  });

  it('can be passed to dust.render even if it is anonymous', function() {
    tmpl = load("Hello anonymous {world}!");
    dust.render(tmpl, context, function(err, out) {
      expect(out).toEqual("Hello anonymous world!");
    });
  });

  it('can be loaded via dust.onLoad', function() {
    dust.onLoad = function(nameOrTemplate, callback) {
      // Haha, you asked for some random template but we will always give you ours instead
      callback(null, tmpl);
    };
    dust.render('foobar', context, function(err, out) {
      expect(out).toEqual(rendered);
    });
  });
});
