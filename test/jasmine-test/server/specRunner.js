var jasmine = require('jasmine-node'),
    sys = require('util'),
    path = require('path');

/* this should be declared global in order to access them in the spec*/
dust = require('../../../lib/dust'),
coreTests = require('../spec/coreTests');

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

var options = [];
options['specFolders'] = [path.dirname(__dirname) + '/spec'] ;
options['isVerbose'] = isVerbose;
options['showColors'] = showColors;
options['onComplete'] = function(runner, log) {
  if (runner.results().failedCount === 0) {
    return process.exit(0);
  } else {
    return process.exit(1);
  }
};

jasmine.executeSpecsInFolder(options);