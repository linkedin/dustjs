---
layout: docs
title: Dust Syntax
permalink: /docs/helper-api/
---

##Dust Helpers
###Function definition
```
    dust.helpers.myHelper = function(chunk, context, bodies, params) {
       /* Crazy logic here */
    }
```
###Parameters
* chunk: The currently accumulating output of the template render process.
* context: The current context stack.  This could be your base context when rendering the template, but can change if you are in a context change `{#newContext}`.
* bodies: Holds any body sections nested within the helper. For example, the `{:else}` body in an exists check.
* params: An object that holds all the parameters passed when calling the custom helper.
* @return: {Chunk} The chunk object that was passed in so that chunk function calls can be chained.

###Example
In this example, we will write a helper that will add a period to the end or beginning of the body depending on a parameter. 

####Javacript function definition for a helper

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
  }
  return chunk;
}
```

####Helper call in the template:

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

###In depth API about chunks, contexts, and bodies goes here