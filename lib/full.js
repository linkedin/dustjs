var dust = require( 'dust' );
require( 'compiler' )( dust );
dust.parse = require( 'parser' ).parse;
module.exports = dust;