---
title: Partials
layout: guides
permalink: /guides/partials/
---

Templates can include other templates by using partials. Rather than specifying the templates to include in a controller or configuration file, Dust allows you to write your partials inline as part of your template.

A template includes a partial using Dust's [partial syntax](/docs/syntax/#partial). The partial's name is the name that was used [to compile the template](/guides/getting-started/#compiling-dust-templates).

```
{>"template-name"/}
```

All characters are valid in a template name. However, if the template name includes characters that aren't allowed in Dust references, you should wrap the template name in quotes when including it as a partial.

A partial relies on the JSON context of the parent template invoking it. Like [sections](/guides/getting-started/#sections), partials also accept parameters that add extra references. By passing more data into the partial using parameters, you can build components that are customized to different contexts without relying on their parent's data. For example, there might be several versions of a header that you wish to include, which can be controlled using parameters:

```
{>"header" mode="classic"/}
```

Again, as in sections, inline parameters passed to a partial will not override the current context if a reference of the same name already exists.

<dust-demo templateName="disney-park" hideOutput="true">
<dust-demo-template showTemplateName="true">
<p>{?isGreeting}Greetings{:else}Goodbye{/isGreeting} from {parkName}, The {qualifier} Place on Earth!</p>
</dust-demo-template>
</dust-demo>

<dust-demo templateName="disney">
<dust-demo-template showTemplateName="true">
{#parks}
  {>"disney-park" parkName=name qualifier=qualifier/}{~n}
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
