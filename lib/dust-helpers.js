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
  /*
   * Dust can only do simple string interpolation ex: 
   * {#context foo="{bar}"} and not {#context foo="{bar.baz}"}. Boo!
   * This prevents us from passing {bar.baz} into a context as a param.
   * So, when we need lookup baz by crawling out from the curent context...
   * usage: {@lookup key="bar.baz"/}
   *
   * Note: This should be corrected in dust.
   */
  
  lookup: function( chunk, context, bodies, params ){
    var path = params.path.split( '.' ),
      value,
      index = 0,
      depth = path.length - 1;

    //Crawl up the stack and Test to see if the path exists
    ( function test( subject ){
 
      //Restart the test with the next branch
      function next() {
        subject = context.stack.tail.head;
        index = 0;
        test( subject );
      }

      if( subject[path[index]] ){
        subject = subject[path[index]];
        if( index < depth ) {
          if( typeof subject === "object" && subject.hasOwnProperty ) {
            //Its an object, so continue
            index += 1;
            test( subject );
          } else {
            //It's not an object, 
            //and we have not reached the end of our path.
            //Test the next branch
            next();
          }
        } else {
          //we have exhausted our path and have a subject
          value = subject;
        }
      } else {
        //It dose not exist on this branch.
        next();
      }
    }( context.stack.tail.head ) );

    chunk.write( value );
    return chunk;

  },
  if: function( chunk, context, bodies, params ){
    var cond = ( params.cond );
    
    if( params && params.cond ){
      // resolve dust references in the expression
      if( typeof cond === "function" ){
        cond = '';
        boundary = '';
        chunk.tap( function( data ){
          if( boundary !== '' && boundary[boundary.length - 1] === "{" ) {
            data = ( data === '' || data === '}' ) ? false : true;
            boundary = '';
          } else {
            boundary = data;
          }
          cond += data;
          // replace the { } tokens from the  cond value
          cond = cond.replace( "{", "" );
          cond = cond.replace( "}", "" );
          return '';
        } ).render( params.cond, context ).untap();
        if( cond === '' ){
          cond = false;
        }
      }
      // eval expressions with no dust references
      if( eval( cond ) ){
       return chunk.render( bodies.block, context );
      } 
      if( bodies['else'] ){
       return chunk.render( bodies['else'], context );
      }
    } 
    // no condition
    else {
      if( window.console ){
        window.console.log( "No expression given!" );
      }
    }
    return chunk;
  }
};

dust.helpers = helpers;

})(typeof exports !== 'undefined' ? exports : window.dust);