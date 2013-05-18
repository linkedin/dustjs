/*
 * Uses CommonJS, Node, AMD or browser globals to create a module
 * per pattern of UMD
 * https://github.com/umdjs/umd/
 */

( function(root, factory) {
		if( typeof exports === 'object') {
			// Node. Does not work with strict CommonJS, but
			// only CommonJS-like enviroments that support module.exports,
			// like Node.
			module.exports = factory();
		} else if( typeof define === 'function' && define.amd) {
			// AMD. Register as an anonymous module.
			define(factory);
		} else {
			// Browser globals (root is window)
			root.dust = factory();
			root.getGlobal = function() {
				return (function(){
					return this.dust;
				}).call(null);
			};
		}
	}(this, function() {
		/* @module dustjs-linkedin
		 * @returns dust
		 */
		
		