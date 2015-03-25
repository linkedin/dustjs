/*global process*/
var path = require('path'),
    vm = require('vm'),
    dust = require('./dust'),
    parser = require('./parser'),
    compiler = require('./compiler');


// use Node equivalents for some Dust methods
var context = vm.createContext({dust: dust});
dust.loadSource = function(source, path) {
  return vm.runInContext(source, context, path);
};

dust.nextTick = process.nextTick;

// Publish a Node.js require() handler for .dust files
if (require.extensions) {
    require.extensions[".dust"] = function(module, filename) {
        var fs = require("fs");
        var text = fs.readFileSync(filename, 'utf8');
        var source = dust.compile(text, filename);
        var body = dust.loadSource(source, filename);

        module.exports = body;
        module.exports.render = function (context, callback) {
          dust.render(filename, context, callback);
        };
        module.exports.stream = function (context) {
          return dust.stream(filename, context);
        };
    };
}

module.exports = dust;
