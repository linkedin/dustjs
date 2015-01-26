---
layout: docs
title: Dust Syntax
permalink: /docs/api/
---

##Compiling a template
###Function call
```    
dust.compile(content, templateName);
```
###Parameters
* content {String}: The content of your dust template.
* templateName {String}: The name under which the template will be registered.  This is the name you will use when rendering the template.
* @return {String} compiled javascript output of the template.

###Example call
Assuming you have the dust compiler in your JS environment, you can compile a Dust template source file to JavaScript form. The following will compile this very simple template "Hello {name}!" to a JavaScript string that will also register it as a template named "intro".

```
var compiledTemplate = dust.compile("Hello {name}!", "intro");
```

If you include the "compiled" output as part of a script block of JS that you load, then the "intro" template will be defined and registered. 

```
<script type="text/javascript">
/* example compiled dust template output */
(function() {
  dust.register("demo", body_0);

  function body_0(chk, ctx) {
    return chk.write("Hello ").reference(ctx.get("name"), ctx, "h").write("! You have ").reference(ctx.get("count"), ctx, "h").write(" new messages.");
  }
  return body_0;
})();
</script>
```

If you want to register it directly from the ouput of the dust.compile function, use dust.loadSource:

```
var compiledTemplate = dust.compile("Hello {name}!", "intro");
dust.loadSource(compiledTemplate);
```

This will also define and register the template.  All of these compiled templates are saved in the dust.cache Array under the name they were registered under, in this case, "intro".

##Rendering a template
###Function call
```    
dust.render(templateName, data, callback);
```
###Parameters
* templateName {String}: The registered name of the template to render.  This was the name given to the template at the compilation step.
* data {Object}: The javascript context to be consumed by the template.
* callback {Function}: The function that gets called when the render either succeeds or fails.
* @return {Void}

###Example call
Assuming you have the "intro" template we previously compiled and loaded, you can render it using the code below.

```
dust.render("intro", {name: "Fred"}, function(err, out) {
    if (err) {
      console.log(err)
    } else {
      console.log(out);
    }
});
```

##Streaming a template
###Function call
```    
dust.stream(templateName, data);
```
###Parameters
* templateName {String}: The registered name of the template to render.  This was the name given to the template at the compilation step.
* data {Object}: The javascript context to be consumed by the template.
* @return {Void}

###Event types
* data: Fired whenever there is a new chunk of content.
* end: Fired when the template is done streaming.
* error: Fired when the template contains an error.  This will stop any further streaming.

###Example call
Streaming can be used in place of rendering to get the outputs of a template asynchronously, such that you can set up parallel processes to get the outputted template data at blazing fast speeds.  Streaming is asynchronous, so the rendering is based on event callbacks instead of a callback that you pass to the function itself.

```
var ouptut, finished;
dust.stream(test.name, context)
      .on('data', function(data) {
        output += data;
      }).on('end', function() {
        finished = true;
        console.log(output);
      }).on('error', function(err) {
        finished = true;
        output = err.message || err;
        console.log(output);
      });
```