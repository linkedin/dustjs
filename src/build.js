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
    parserPlaceholder = '\'PARSER_CODE_HERE\'',
    buildMessagePlaceHolder = 'BUILD_MESSAGE_HERE',
    buildMessage = 'Do not edit the parser directly. This is a generated file created using a build script and the PEG grammar.';


fs.writeFileSync(path.join(root, 'lib', 'parser.js'), umdWrapper.replace(parserPlaceholder, parser.toSource()).replace(buildMessagePlaceHolder, buildMessage).replace('this.SyntaxError','parser.SyntaxError'));
