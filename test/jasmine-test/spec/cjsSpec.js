/*global describe,expect,it,beforeEach */
/*jshint evil:true*/
var dust = require('../../../');

function load(tmpl) {
  dust.config.cjs = true;
  return eval(dust.compile(tmpl, 'hello'))(dust);
}

describe('CommonJS template', function() {
  var template = "Hello {world}!",
      context = { world: "world" },
      rendered = "Hello world!",
      templateName = 'hello',
      tmpl;

  beforeEach(function() {
    tmpl = load(template);
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
    tmpl = eval(dust.compile("Hello anonymous {world}!"))(dust);
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
