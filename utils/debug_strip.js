var fs   = require('fs'),
    path = require('path'),
    root = path.join(path.dirname(__filename), "..");

var orig_code = fs.readFileSync(path.join(root, process.argv[2]), 'utf8');

var final_code = orig_code.replace(/\/\* DEBUG \*\/.*?\/\*\ ENDDEBUG \*\//g, '');
    
fs.writeFileSync(path.join(root, process.argv[3]),final_code);