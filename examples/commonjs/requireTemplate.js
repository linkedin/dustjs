var path = require('path'),
    root = path.resolve.bind(path, './views/');

var dust = require('dustjs-linkedin');

// Add any extra helpers, do dust config, etc., in a single location
// This helper just uppercases anything inside its body
dust.helpers.shout = function(chunk, context, bodies, params) {
  return chunk.tap(function(data) {
    return data.toUpperCase();
  }).render(bodies.block, context).untap();
};

// Here's our app-specific logic
function requireTemplate(name, callback) {
  var tmpl;
  try {
    tmpl = require(root(name))(dust);
  } catch(e) {
    if (callback) { callback(e); } else { throw e; }
  }
  if (callback) {
    callback(null, tmpl);
  } else {
    return tmpl;
  }
}

// Adding an `onLoad` function lets us load partials
module.exports = dust.onLoad = requireTemplate;
