var path = require('path'),
    root = path.resolve.bind(path, './views/');

var dust = require('dustjs-linkedin');

// Add any extra helpers, do dust config, etc...
dust.helpers.shout = function(chunk, context, bodies, params) {
  return chunk.tap(function(data) {
    return data.toUpperCase();
  }).render(bodies.block, context).untap();
};

// Adding an `onLoad` function lets us load partials
dust.onLoad = function(templateName, callback) {
  requireTemplate(templateName);
  callback();
};

function requireTemplate(name) {
  var tmpl = require(root(name));
  return tmpl(dust);
}

module.exports = requireTemplate;
