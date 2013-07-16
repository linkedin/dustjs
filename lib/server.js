var path = require('path'),
    parser = require('./parser'),
    vm = require('vm');

module.exports = function(dust) {
  var compiler = require('./compiler')(dust);
  compiler.parse = parser.parse;
  dust.compile = compiler.compile;

  var context = vm.createContext({dust: dust});
  dust.loadSource = function(source, path) {
    return vm.runInContext(source, context, path);
  };

  dust.nextTick = process.nextTick;

  // expose optimizers in commonjs env too
  dust.optimizers = compiler.optimizers;
}
