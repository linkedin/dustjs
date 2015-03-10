---
title: DustJS by LinkedIn
layout: default
---

<dust-demo templateName="welcome">
<dust-demo-template showTemplateName="true">Dust does {#features}{name}{@sep}, {/sep}{/features}!</dust-demo-template>
<dust-demo-json>{
  features: [
    {name: "async"},
    {name: "helpers"},
    {name: "filters"},
    {name: "a little bit of logic"},
    {name: "and more"}
  ]
}</dust-demo-json>
</dust-demo>

# What is Dust?

Dust is a Javascript templating engine. It inherits its look from the [ctemplate](https://code.google.com/p/ctemplate/) family of languages, and is designed to run asynchronously on both the server and the browser.

# Why Dust?

This overview won't tell you about all the features Dust has to offer. Instead, we'll focus on some of the differentiators between Dust and other Javascript templating languages.

## Not logicless... just less logic

You cannot write arbitrary Javascript inside Dust templates. However, you still have basic logical operators like comparison, less than / greater than, and exists / not exists. This strikes a balance between template readability and data control.

Instead, Dust encourages you to move the logic to your data model. You can create functions inside the model that are then called by the template, giving you complete control over how your templates render without cluttering them with logic.

So instead of this:

```
{@eq key="userExists" value="true"}
  {@eq key="passwordOK" value="true"}
    {@gt key="userLevel" value=3}
      {@eq key="accountActive" value="true"}
        Welcome!
      {/eq}
    {/gt}
  {/eq}
{/eq}
```

Dust encourages you to write this:

```
{#userAuthenticated}
  Welcome!
{/userAuthenticated}
```

## Asynchronous template loading, rendering, and streaming

Dust can load and render templates on-the-fly, so you don't have to preload them. For example, instead of concatenating all templates into a file that's loaded via a `<script>` tag, you might choose to asynchronously load templates as they're requested. Or, if you're using Dust in Node, you could load templates from the filesystem, read them from an in-memory cache, or compile them just-in-time.

In addition, while Dust is waiting to load a template, it can continue rendering the rest of the page asynchronously. After loading is complete, the missing template will be seamlessly added.

This asynchronous rendering isn't limited to waiting for templates. If you make HTTP requests to an external data source, Dust will continue to render the template while it waits for the request to complete.

Finally, Dust has a Node Streams-compliant interface to allow you to pipe its output incrementally. So, you can flush the output of a large template piece-by-piece to the browser to reduce the time the user stares at a blank screen.

## Composable templates

You shouldn't have to manually build layouts in code-- that information belongs in your templates. Dust supports partial includes and dynamic template blocks so that you can write simple templates and stitch them together however you want.

## HTML-safe, format-agnostic

It's likely that you're using Dust to render HTML. Dust helps you out by safely escaping data, preventing cross-site scripting attacks. Filters are also included for Javascript and JSON output, and you can add your own filters easily.

Dust doesn't force you to output HTML, though. It works just as well to generate any number of formats, such as Markdown, JSON, or YAML.

## High performance

Dust attempts to strike a balance between performance and features. While it's not as fast as a truly logicless templating system like Mustache, its asynchronous nature means that it will start rendering large templates more quickly.

Dust can precompile your templates for even more speed, or dynamically load them so that you don't take the up-front performance hit of loading a bunch of templates that you'll never use. (Or, preload a subset of templates and dynamically load the rest. You can do that too.)

## Widely-supported

Dust works where Javascript works. You can use Dust as far back as IE7, as well as on the server using Node, io.js, Rhino, or Nashorn.
