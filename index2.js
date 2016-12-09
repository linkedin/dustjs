/**
 * We need to implement a fix for require.
 * dust doesn't seem to work that great with automately right now
 * but this workaround seems to work right now
 * @type {*|require}
 */

// We are using unsafe module loading to load dustjs (require(moduleId, unsafe;))
var oldRequire = require;
require = function(moduleId){
    if(moduleId.indexOf("./dust") == 0 ||
        moduleId.indexOf("./parser") == 0 ||
        moduleId.indexOf("./compiler") == 0){
        var newModuleId = moduleId.replace("./", "../lib/");
        if(!newModuleId.indexOf(".js") > -1){
            newModuleId += ".js";
        }
        return oldRequire(newModuleId, true);
    }
    return oldRequire(moduleId, true);
};

var dust = require('dist/dust-full.js');
module.exports = dust;
require = oldRequire;
