var path = require('path'),
    tools = require('./compiler'),
    Script = process.binding('evals').Script;

require.paths.unshift(path.join(__dirname, '..'));

module.exports = function(dust) {
  dust.compile = tools.compile;

  dust.loadSource = function(source, path) {
    Script.runInNewContext(source, {dust: dust}, path);
  };

  dust.nextTick = process.nextTick;
}