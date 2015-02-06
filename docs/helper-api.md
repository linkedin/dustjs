---
layout: docs
title: Dust Syntax
permalink: /docs/helper-api/
---

## Dust Helpers

### Function definition
```
    dust.helpers.myHelper = function(chunk, context, bodies, params) {
       /* Crazy logic here */
       return chunk;
    }
```

### Parameters

* chunk {Chunk}: An object created by the dust core that holds the currently accumulating output of the template render process.
    * **Instance Functions**
        * write - Write out a plain string to the chunk
            * **Parameters**
                * data {String} the text to attach to the chunk
            *  **Return Value**
                * {Chunk} The original chunk with the new string attached
        * render - Evaluate the current chunk
            * **Parameters**
                * body {Function} The dust function that will run against the chunk and context
                * context {Context} The data to be used to render this chunk
            * **Return Value**
                * {String} The output of the body call
        * map - Inserts a new chunk that can be used to asynchronously render or write to it
            * **Parameters**
                * callback {Function} The function that will be called with the new chunk
            * **Return Value**
                * {Chunk} A copy of this chunk instance in order to further chain function calls on the chunk
        * tap - Puts a filter function into a stack that will run against subsequent chunk.write calls
            * **Parameters**
                * tap {Function} The function that will be pushed on top of the tap stack
            * **Return Value**
                * {Chunk} The chunk instance
        * untap - Pops the function on the top of the stack that was pushed from chunk.tap
            * **Return Value**
                * {Chunk} The chunk instance
        * setError - set an error on the chunk and stop rendering
            * **Parameters**
                * error {String|Error} The error object to put on the chunk
            * **Return Value**
                * {Chunk} The chunk instance
    * **Instance Attributes**
        * flushable {Boolean} - Whether the chunk is ready to be output and hand itself off to the next chunk in the chain
        * data {Array} - The strings to output
        * error {String|Error} - Any error that was set during the render process
        * next {Chunk} - The next chunk in the render chain
* context {Context}: An object created by the dust core that holds the current context stack.  This could be your base context when rendering the template, but can change if you are in a context change `{#newContext}`
    * **Instance Functions**
        * get - Get a value from the data out of a key name
            * **Parameters**
                * path {String} The dot seperated key identifier
                * current {Boolean} If it should search in parent contexts.  false/undefined means it will search in parent contexts, while true will only search the current context
            * **Return Value**
                  * {*} The value in the context for that key
        * getTemplateName - Get the name of the template that this context was used for
            * **Return Value**
                * {String} the name of the template
    * **Instance Attributes**
        * stack {Stack} - A filtered view of the json context passed to dust.render, dust.stream, or dust.renderSource
        * global {Object} - Contains any data that you want to access on this instance
        * blocks {Array} - A list of objects that which hold the inline blocks defined in a template.  The objects are keyed by the name of the inline block and the values are the compiled javascript functions of their body
* bodies: Holds any body sections nested within the helper. For example, the `{:else}` body in an exists check
    * **Instance Attributes**
        * block {Function} - The javascript function attached to the first section of the helper
        * `*` {Function} - The javascript function attached to the subsequent sections of the helper `e.g. {:else} -> bodies['else']`
* params: An object that holds all the parameters passed when calling the custom helper
* **Return Value**
    * {Chunk} The chunk object that was passed in so that chunk function calls can be chained.  It is important to not forget to return this, or your template will cease rendering early

### Example
In this example, we will write a helper that will add a period to the end or beginning of the body depending on a parameter. 

#### JavaScript function definition for a helper

```
dust.helpers.period = function(chunk, context, bodies, params) {
  var location = params.location,
      body = bodies.block;
  if (location === 'start') {
    chunk.write('.');
    chunk.render(body, context);
  } else if (location === 'end') {
    chunk.render(body, context);
    chunk.write('.');
  } else {
    dust.log('WARN', 'missing parameter "location" in period helper');
  }
  return chunk;
};
```

#### Helper call in the template:

```
{@period location="end"}
  Hello World
{/period}
{!-- outputs "Hello World." --!}

{@period location="start"}
  Hello World
{/period}
{!-- outputs ".Hello World" --!}
```
