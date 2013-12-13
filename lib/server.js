/*global process*/
var path = require('path'),
    vm = require('vm'),
    dust = require('./dust'),
    parser = require('./parser'),
    compiler = require('./compiler');


// for Node provide the full Dust API and augment some functions
// expose parser methods
dust.parse = parser.parse;

// expose compiler methods
dust.compile = compiler.compile;
dust.filterNode = compiler.filterNode;
dust.optimizers = compiler.optimizers;

/* these are currenltly in the API  */
dust.pragmas = compiler.pragmas;
dust.compileNode = compiler.compileNode;
dust.nodes = compiler.nodes;

var context = vm.createContext({dust: dust});
dust.loadSource = function(source, path) {
  return vm.runInContext(source, context, path);
};

dust.nextTick = process.nextTick;

module.exports = dust;
