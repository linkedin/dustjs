(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('./dust'));
    // @see server file for parser methods exposed in node
  } else {
    var parser = factory(root.dust);
  }
}(this, function(dust) {
  var parser = 'PARSER_CODE_HERE';

  // expose parser methods
  dust.parse = parser.parse;

  return parser;
}));
  

