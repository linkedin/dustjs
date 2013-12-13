(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
    // @see server file for parser methods exposed in node
  } else {
    // expose parser methods to the browser
    root.dust.parse = factory().parse;
  }
}(this, function() {
  var parser = 'PARSER_CODE_HERE';
  return parser;
}));
  

