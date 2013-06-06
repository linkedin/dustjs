var dust = require( './dust.js' );
require( './compiler.js' )( dust );
dust.parse = require( './parser.js' ).parse;
module.exports = dust;