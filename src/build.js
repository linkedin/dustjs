var peg  = require('pegjs'),
    fs   = require('fs'),
    path = require('path'),
    root = path.join(path.dirname(__filename), "..");

var options = {
    cache: false,
    trackLineAndColumn: true 
};

var parser = peg.buildParser(fs.readFileSync(path.join(root, 'src', 'dust.pegjs'), 'utf8'), options);

var namespace = 'parser';

fs.writeFileSync(path.join(root, 'lib', 'parser.js'), "var dustParser = (function(dust){\n\nvar "+namespace+" = "
  + parser.toSource().replace('this.SyntaxError', ''+namespace+'.SyntaxError') + ";\n\n"
  + "dust.parse = "+namespace+".parse;\n\n"
  + "});\n\nif (typeof exports !== 'undefined') {\n	dustParser(exports);\n} else if (typeof define === 'function' && define.amd) {\n	dustParser(dust);"
  + "\n} else {\n  dustParser(typeof getGlobal !== 'undefined' ? getGlobal() : dust);\n}"
);
