(function(dust){
  
var helpers = {
  
  sep: function(chunk, context, bodies) {
    if (context.stack.index === context.stack.of - 1) {
      return chunk;
    }
    return bodies.block(chunk, context);
  },

  idx: function(chunk, context, bodies) {
    return bodies.block(chunk, context.push(context.stack.index));
  },
  
  "if": function( chunk, context, bodies, params ){
    if (params && params.cond) {
      var cond = dust.resolve("cond", chunk, context, bodies, params),
        test = new Function("chunk", "context", "bodies", "params", "return " + cond);
      if (test()) {
        return chunk.render(bodies.block, context);
      }
      if (bodies['else']) {
        return chunk.render(bodies['else'], context);
      }
    } else {
      if (window.console) {
        window.console.log("dust.helpers.if: no expression given");
      }
    }
    return chunk;
  }
};

dust.helpers = helpers;

dust.resolve = function (name, chunk, context, bodies, params) {
  var output = "", pending = false, code = "", exec;
  if (params && params[name]) {
    if (typeof params[name] === "function") {
      chunk.tap(function (data) {
        data += "";
        var leftIndex = data.indexOf("{{"), rightIndex = data.indexOf("}}");
        if (leftIndex >= 0 || rightIndex >= 0) {
          if (leftIndex >= 0) {
            output += data.substring(0, leftIndex);
            pending = true;
          }
          if (rightIndex >= 0) {
            if (rightIndex > 0) {
              code += data.substring(leftIndex + 2, rightIndex);
            }
            exec = new Function("chunk", "context", "bodies", "params", "return " + code);
            output += exec(chunk, context, bodies, params);
            code = "";
            pending = false;

            output += data.substring(rightIndex + 2);
          } else {
            code += data.substring(leftIndex + 2);
          }
        } else {
          if (pending) {
            code += data;
          } else {
            output += data;
          }
        }
        return "";
      }).render(params[name], context).untap();
    } else {
      output = params[name];
    }
  }
  return output;
};

})(typeof exports !== 'undefined' ? exports : window.dust);