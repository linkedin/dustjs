---
layout: docs
title: Dust Syntax
permalink: /docs/api/
---

## dust.compile

### Function call
```    
dust.compile(content, templateName);
```

### Parameters
* content {String}: The content of your dust template.
* templateName {String}: The name under which the template will be registered.  This is the name you will use when rendering the template.

### Return Value
* {String} Template compiled to JavaScript.

### Example call
Assuming you have the dust compiler in your JS environment, you can compile a Dust template source file to JavaScript form. The following will compile this very simple template "Hello {name}!" to a JavaScript string that will also register it as a template named "intro".

```
var compiledTemplate = dust.compile("Hello {name}!", "intro");
```

If you include the "compiled" output as part of a script block of JS that you load, then the "intro" template will be defined and registered. 

```
<script type="text/javascript">
/* example compiled dust template output */
(function() {
  dust.register("intro", body_0);

  function body_0(chk, ctx) {
      return chk.write("Hello ").reference(ctx._get(false, ["name"]), ctx, "h").write("!");
  }
  return body_0;
})();
</script>
```

All of these compiled templates are saved in the dust.cache Array under the name they were registered under, in this case, "intro".

## dust.loadSource

### Function call
```
dust.loadSource(compiledOutput);
```

### Parameters
* compiledOutput {String}: The compiled dust template

### Return Value
* {Void}

Use dust.loadSource when you want to register a template directly from the ouput of the dust.compile function without using a script block:

```
var compiledTemplate = dust.compile("Hello {name}!", "intro");
dust.loadSource(compiledTemplate);
```

## dust.render

### Function call
```
dust.render(templateName, data, callback);
```

### Parameters
* templateName {String}: The registered name of the template to render.  This was the name given to the template at the compilation step.
* data {Object}: The data to be used to populate the template.
* callback {Function}: The function that gets called when the render either succeeds or fails.
    * **Parameters**
        * error {String} Contains any error that was caused by the rendering the template
        * output {String} Contains the full output of the rendered template.  If error is non-empty, output will be empty.
    * **Return Value**
        * {Void}

### Return Value
{Void}

### Example call
Assuming you have the "intro" template we previously compiled and loaded, you can render it using the code below.

```
dust.render("intro", {name: "Fred"}, function(error, output) {
    if (err) {
      console.log(error);
    } else {
      console.log(output); // output === 'Hello Fred!'
    }
});
```

## dust.stream

### Function call
```    
var stream = dust.stream(templateName, data);
stream.on('data', dataCallback)
      .on('end', endCallback)
      .on('error', errorCallback);
```

### Parameters
* templateName {String}: The registered name of the template to render.  This was the name given to the template at the compilation step.
* data {Object}: The javascript context to be used to populate the template.

### Return Value
* {Stream} An object that can be used to attach event callbacks to.

### Event types
* data: Fired for each chunk of the template whenever the template has completed rendering.  Sends an output string.
* end: Fired when the template is done streaming. Sends no parameters.
* error: Fired when the template contains an error.  This will stop any further streaming.  Sends an error string or error object.

### Example call
Streaming can be used in place of rendering to get the outputs of a template asynchronously, such that you can set up parallel processes to get the outputted template data at blazing fast speeds.  Streaming is asynchronous, so the rendering is based on event callbacks instead of a callback that you pass to the function itself.

```
var ouptut, finished;
dust.stream(test.name, context)
      .on('data', function(segment) {
        output += segment;
      }).on('end', function() {
        finished = true;
        console.log(output);
      }).on('error', function(error) {
        finished = true;
        output = error.message || error;
        console.log(output);
      });
```
