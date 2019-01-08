// Including compiler for CommonJS browser environments.
// this replaces server.js via the "browser" attribute on package.json
// for bundling environments like browserify
module.exports = function (dust) {
  var parser = require('./parser'),
    compiler = require('./compiler')(dust);

  compiler.parse = parser.parse;
  dust.compile = compiler.compile;
  dust.optimizers = compiler.optimizers;
};
