/*global process*/
var vm = require('vm'),
    dust = require('./lib/dust.js'),
    parser = require('./lib/parser.js'),
    compiler = require('./lib/compiler.js');

// use Node equivalents for some Dust methods
var context = vm.createContext({dust: dust});
dust.loadSource = function(source, path) {
  return vm.runInContext(source, context, path);
};

dust.nextTick = process.nextTick;

module.exports = dust;
