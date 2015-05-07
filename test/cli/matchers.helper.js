var fs = require('fs'),
    dust = require('../../');

var matchers = {};

matchers.toHaveTemplate = function(util) {
  var dustTemplateRegex = /dust\.register\("([A-z0-9\-_\/\\]+)",body_0\)/g;

  return {
    compare: function(actual, expected) {
      var matches = [];
      actual.replace(dustTemplateRegex, function(whole, match) {
        matches.push(match);
      });
      return { pass: matches.indexOf(dust.escapeJs(expected)) > -1 };
    }
  };
};

matchers.toHaveAMDTemplate = function(util) {
  var dustAMDTemplateRegex = /define\("([A-z0-9\-_\/\\]+)",\["dust\.core"\]/g;

  return {
    compare: function(actual, expected) {
      var matches = [];
      actual.replace(dustAMDTemplateRegex, function(whole, match) {
        matches.push(match);
      });
      return { pass: matches.indexOf(dust.escapeJs(expected)) > -1 &&
                     matchers.toHaveTemplate().compare.call(this, actual, expected) };
    }
  };
};

matchers.toHaveCJSTemplate = function(util) {
  var dustCJSTemplateRegex = /module\.exports\=function\(dust\)\{/g;

  return {
    compare: function(actual, expected) {
      var matches = [];
      actual.replace(dustCJSTemplateRegex, function(whole, match) {
        matches.push(match);
      });
      return { pass: matches.length &&
                     matchers.toHaveTemplate().compare.call(this, actual, expected) };
    }
  };
};

matchers.toBeFileWithTemplate = function(util) {
  return {
    compare: function(actual, expected) {
      actual = fs.readFileSync(actual, "utf8");
      return { pass: matchers.toHaveTemplate().compare.call(this, actual, expected) };
    }
  };
};

beforeEach(function() {
  jasmine.addMatchers(matchers);
});
