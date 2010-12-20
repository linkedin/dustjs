var path = require('path'),
    parser = require('./parser'),
    compiler = require('./compiler'),
    Script = process.binding('evals').Script;

require.paths.unshift(path.join(__dirname, '..'));

module.exports = function(dust) {
  compiler.parse = parser.parse;
  dust.compile = compiler.compile;

  dust.loadSource = function(source, path) {
    return Script.runInNewContext(source, {dust: dust}, path);
  };

  dust.nextTick = process.nextTick;

  // expose optimizers in commonjs env too
  dust.optimizers = compiler.optimizers;
}
