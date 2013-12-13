/*global __filename */
var peg  = require('pegjs'),
    fs   = require('fs'),
    path = require('path'),
    root = path.join(path.dirname(__filename), '..');

var options = {
    cache: false,
    trackLineAndColumn: true
};

var parser = peg.buildParser(fs.readFileSync(path.join(root, 'src', 'dust.pegjs'), 'utf8'), options),
    umdWrapper = fs.readFileSync(path.join(root, 'src', 'umdParserWrapper.js'), 'utf8'),
    placeholder = '\'PARSER_CODE_HERE\'';


fs.writeFileSync(path.join(root, 'lib', 'parser.js'), umdWrapper.replace(placeholder, parser.toSource().replace('this.SyntaxError','parser.SyntaxError')));
