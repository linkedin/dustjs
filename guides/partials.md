---
title: DustJS | Partials
layout: guides
permalink: /guides/partials/
---

# Partials

A Dust partial promotes *DRY* ("don't repeat yourself") conventions in shared markup. Breaking templates up into partials can make them easier to maintain and reuse, and partials themselves can be composed of one or more partials. This is the basis for components or reusable templates for tasks like including a common header and footer on multiple pages. Lets peek under the covers to see how a Dust partial works.

A partial template is added to another template using Dust's partial syntax. Note that the tag is self-closing (`/}`).

```
{>"template-name"/}
```

Partials rely on the JSON context of the parent template invoking it. Like [sections](/guides/getting-started/#sections), partials also accept parameters that add extra references. By passing more data into the partial using parameters, you can build components that are customized to different contexts easily. For example, there might be several versions of a header that you wish to include, which can be controlled with code like `{>"header" mode="classic"/}`.

Just like in sections, inline parameters will not override the current context if a reference of the same name already exists.

In the following example, notice that `isGreeting` is only defined in the data for the `disney` template, but it is available in every instance of the included `disney-park` partial, while `parkName` and `qualifier` vary per instance.

<dust-demo templateName="disney-park" hideOutput="true">
<dust-demo-template showTemplateName="true">
<p>{?isGreeting}Greetings{:else}Goodbye{/isGreeting} from {parkName}, The {qualifier} Place on Earth!</p>
</dust-demo-template>
</dust-demo>

<dust-demo templateName="disney">
<dust-demo-template showTemplateName="true">
{#parks}
  {>"disney-park" parkName=name qualifier=qualifier/} 
{/parks}
</dust-demo-template>
<dust-demo-json>
{
  "isGreeting": true,
  "parks": [
    {
      "name": "Disneyland",
      "qualifier": "Happiest"
    },
    {
      "name": "Disney World Magic Kingdom",
      "qualifier": "Most Magical"
    }
  ]
}
</dust-demo-json>
</dust-demo>

Let's see how the Dust template rendering knows about a template. Since Dust templates are compiled to JavaScript, part of that compiled result is a call to `dust.register(name, functionImplementingCompiledTemplate)`---check out the Dev Mode of the example above to see this.

The name is not necessarily the file name, but it will be the template name that is used when including the partial with the include syntax. This means that it doesn't really matter what extension you give your Dust template files, though `.dust` and `.tl` are most commonly seen.
