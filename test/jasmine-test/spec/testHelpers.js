dust.testHelpers = {};
dust.testHelpers.tap = function(input, chunk, context) {
  // return given input if there is no dust reference to resolve
  var output = input;
  // dust compiles a string/reference such as {foo} to function,
  if (typeof input === "function") {
    // just a plain function (a.k.a anonymous functions) in the context, not a dust `body` function created by the dust compiler
    if (input.isFunction === true) {
      output = input();
    } else {
      output = '';
      chunk.tap(function(data){
         output += data;
         return '';
        }).render(input, context).untap();
      if (output === '') {
        output = false;
      }
    }
  }
 return output;
};