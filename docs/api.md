---
layout: docs
title: Dust Syntax
permalink: /docs/api/
---

## Compiling a template
Assuming you have the dust compiler in your JS environment, you can compile a Dust template source file to JavaScript form. The following will compile this very simple template "Hello {name}!" to a JavaScript string that will also register it as a template named "intro".

```
var compiledTemplate = dust.compile("Hello {name}!", "intro");
```

If you include the "compiled" string as part of a script block of JS that you load, then the "intro" template will be defined and registered. If you want to do it immediately then do:

```
dust.loadSource(compiled);
```

This will also define and register the template.  All of these compiled templates are saved in the dust.cache Array under the name they were registered under, in this case, "intro".

## Rendering a template
Assuming you have the "intro" template we previously compiled and loaded, you can render it using the code below. The first argument to dust.render is the registered template name, the second argument is the JSON model, the third argument is a callback function where "out" contains the rendered output from running the template (and err has any error information).

```
dust.render("intro", {name: "Fred"}, function(err, out) {
    console.log(out);
});
```

## Streaming a template
Streaming can be used in place of rendering to get the outputs of a template asynchronously, such that you can set up parallel processes to get the outputted template data at blazing fast speeeds.  Streaming is asyncronous, so it the rendering is based on event callbacks.

```
var ouptut, finished;
dust.stream(test.name, context)
      .on('data', function(data) {
        output += data;
      }).on('end', function() {
        finished = true;
      }).on('error', function(err) {
        finished = true;
        output = err.message || err;
      });
```
