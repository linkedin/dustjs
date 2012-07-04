(function(dust){

/* make a safe version of console if it is not available
 * currently supporting:
 *   _console.log 
 * */
var _console = (typeof console !== 'undefined')? console: {
  log: function(){
     /* a noop*/
   }
};

function isSelect(context) {
  var value = context.current();
  return typeof value === "object" && value.isSelect === true;    
}

function filter(chunk, context, bodies, params, filter) {
  var params = params || {},
      actual, expected;
  if (params.key) {
    actual = context.get(params.key);
  } else if (isSelect(context)) {
    actual = context.current().value;
    if (context.current().isResolved) {
      filter = function() { return false; };
    }
  } else {
    throw "No key specified for filter and no key found in context from select statement";
  }
  expected = helpers.tap(params.value, chunk, context);
  if (filter(expected, coerce(actual, params.type, context))) {
    if (isSelect(context)) {
      context.current().isResolved = true;
    }
    return chunk.render(bodies.block, context);
  } else if (bodies['else']) {
    return chunk.render(bodies['else'], context);
  }

  return chunk.write('');
}

function coerce (value, type, context) {
  if (value) {
    switch (type || typeof(value)) {
      case 'number': return +value;
      case 'string': return String(value);
      case 'boolean': return Boolean(value);
      case 'date': return new Date(value);
      case 'context': return context.get(value);
    }
  }

  return value;
}

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
  contextDump: function(chunk, context, bodies) {
    _console.log(JSON.stringify(context.stack));
    return chunk;
  },
  
  // Utility helping to resolve dust references in the given chunk
  tap: function( input, chunk, context ){
    // return given input if there is no dust reference to resolve
    var output = input;
    // dust compiles a string to function, if there are references
    if( typeof input === "function"){
      output = '';
      chunk.tap(function(data){
        output += data;
        return '';
      }).render(input, context).untap();
      if( output === '' ){
        output = false;
      }
    } 
    return output;
  },

  "if": function( chunk, context, bodies, params ){
    if( params && params.cond ){
      var cond = params.cond;
      cond = this.tap(cond, chunk, context);
      // eval expressions with given dust references
      if( eval( cond ) ){
       return chunk.render( bodies.block, context );
      }
      if( bodies['else'] ){
       return chunk.render( bodies['else'], context );
      }
    }
    // no condition
    else {
      _console.log( "NO condition given in the if helper!" );
    }
    return chunk;
  },
  select: function(chunk, context, bodies, params) {
    if( params && params.key){
      var key = params.key;
      key = this.tap(key, chunk, context);
      return chunk.render(bodies.block, context.push({ isSelect: true, isResolved: false, value: context.get(key) }));
    }
    // no key
    else {
      _console.log( "No key given for the select tag!" );
    }
    return chunk;
  },

  eq: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual === expected; });
  },

  lt: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual < expected; });
  },

  lte: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual <= expected; });
  },

  gt: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual > expected; });
  },

  gte: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual >= expected; });
  },

  "else": function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return true; });
  }
};

dust.helpers = helpers;

})(typeof exports !== 'undefined' ? exports : getGlobal());
