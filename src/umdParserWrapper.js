/* BUILD_MESSAGE_HERE */
(function(root, factory) {
  if (typeof exports === 'object') {
    // in Node, require this file if we want to use the parser as a standalone module
    module.exports = factory(require('./dust'));
    // @see server file for parser methods exposed in node
  } else {
    // in the browser, store the factory output if we want to use the parser directly
    factory(root.dust);
  }
}(this, function(dust) {
  var parser = 'PARSER_CODE_HERE';

  // expose parser methods
  dust.parse = parser.parse;

  return parser;
}));
  

