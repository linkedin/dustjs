var jasmine = require('jasmine-node'),
    sys = require('util'),
    path = require('path');

/* this should be declared global in order to access them in the spec*/
dust = require('dustjs-linkedin'),
dust.helpers = require('../../../lib/dust-helpers').helpers,
helpersTests = require('../spec/helpersTests');

//Add the tapper helper to test the Tap helper.
dust.helpers.tapper = function(chunk, context, bodies, params) {
  var result = dust.helpers.tap(params.value,chunk,context); 
  chunk.write(result); 
  return chunk;
};

for(key in jasmine) 
  global[key] = jasmine[key];

isVerbose = true;
showColors = true;
coffee = false;

process.argv.forEach(function(arg) {
  var coffee, isVerbose, showColors;
  switch (arg) {
    case '--color':
      return showColors = true;
    case '--noColor':
      return showColors = false;
    case '--verbose':
      return isVerbose = true;
    case '--coffee':
      return coffee = true;
  }
});

jasmine.executeSpecsInFolder(path.dirname(__dirname) + '/spec', (function(runner, log) {
  if (runner.results().failedCount === 0) {
    return process.exit(0);
  } else {
    return process.exit(1);
  }
}), isVerbose, showColors);
