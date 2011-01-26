var peg  = require('peg'),
    fs   = require('fs'),
    path = require('path'),
    root = path.join(path.dirname(__filename), "..");

var parser = peg.buildParser(fs.readFileSync(path.join(root, 'src', 'dust.pegjs'), 'utf8'));

fs.writeFileSync(path.join(root, 'lib', 'parser.js'), "(function(dust){\n\nvar parser = "
  + parser.toSource().replace('this.SyntaxError', 'SyntaxError') + ";\n\n"
  + "dust.parse = parser.parse;\n\n"
  + "})(typeof exports !== 'undefined' ? exports : window.dust);"
);