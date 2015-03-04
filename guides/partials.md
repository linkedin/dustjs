---
title: DustJS | Getting Started
layout: guides
permalink: /guides/partials/
---

## Partials

A Dust partial promotes "DRY" behavior for reusable/shared markup. Partials themselves can be composed of one or more partials. Partials rely on the JSON/context of the parent template invoking it. Lets peek under the covers to see how a Dust partial works.

You can have multiple .dust files and reference one Dust template as part of another one. This is the basis for components or reusable templates for tasks like a common header and footer on multiple pages. Note that the .dust file extension is used here in examples, but .tl is also commonly seen. Since it only matters to the build process you can use whatever extension works for you.

Let's see how the Dust template rendering knows about a template. As we said earlier, Dust templates are compiled to JavaScript. Part of that compiled result is a call to `dust.register(name, functionImplementingCompiledTemplate)`.

Like sections, partials accept parameters so you can build reusable components that are parameterizable easily. This gives you the same foundation for building libraries as other languages. By passing all the data into the partial using parameters, you isolate the partial from any dependence on the context when it is invoked. So you might have things like `{>header mode="classic" /}` to control the header behavior.

Just like in sections, inline parameters will not override the current context if a property of the same name exists. For example, if the current context already has {name: "Albert"} adding name as a parameter will not override the value when used inside the partial foo.

```{>foo name="will not override Albert"/}```

You will use parameters to pass an object like:

<dust-demo template-name="list_item">
<dust-demo-template><li>{name}</li></dust-demo-template>
<dust-demo-json>{}</dust-demo-json>
</dust-demo>
<dust-demo template-name="list">
  <dust-demo-template><ul>{#names}{>"list_item" name=name/}{/names}</ul></dust-demo-template>
  <dust-demo-json>
    {
      names: ['Dust', 'partial', 'example']
    }
  </dust-demo-json>

</dust-demo>

