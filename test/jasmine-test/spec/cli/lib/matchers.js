var fs = require('fs'),
  dust = require('../../../../../lib/dust');

var matchers = {};

matchers.toHaveTemplate = function(expected) {
  var dustTemplateRegex = /dust\.register\("([A-z0-9\-_\/\\]+)",body_0\)/g,
      matches = [];

  this.actual.replace(dustTemplateRegex, function(whole, match) {
    matches.push(match);
  });

  return matches.indexOf(dust.escapeJs(expected)) > -1;
};

matchers.toHaveAMDTemplate = function(expected) {
  var dustAMDTemplateRegex = /define\("([A-z0-9\-_\/\\]+)",\["dust\.core"\]/g,
      matches = [];

  this.actual.replace(dustAMDTemplateRegex, function(whole, match) {
    matches.push(match);
  });

  return matches.indexOf(dust.escapeJs(expected)) > -1 &&
         matchers.toHaveTemplate.call(this, expected);
};

matchers.toBeFileWithTemplate = function(expected) {
  this.actual = fs.readFileSync(this.actual, "utf8");
  return matchers.toHaveTemplate.call(this, expected);
};

beforeEach(function() {
  this.addMatchers(matchers);
});
