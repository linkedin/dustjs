---
title: Dust.js | Partials
layout: guides
permalink: /guides/partials/
---

# Partials

A Dust partial promotes *DRY* ("don't repeat yourself") conventions in shared markup. Breaking templates up into partials can make them easier to maintain and reuse, and partials themselves can be composed of one or more partials. This is the basis for components or reusable templates for tasks like including a common header and footer on multiple pages. Lets peek under the hood to see how a Dust partial works.

A partial template is added to another template using Dust's [partial syntax](/docs/syntax/#partial). The template name is the name that is chosen [when the template is compiled](/guides/getting-started/#compiling-dust-templates).

```
{>"template-name"/}
```

A partial relies on the JSON context of the parent template invoking it. Like [sections](/guides/getting-started/#sections), partials also accept parameters that add extra references. By passing more data into the partial using parameters, you can build components that are customized to different contexts easily. For example, there might be several versions of a header that you wish to include, which can be controlled using parameters: `{>"header" mode="classic"/}`.

Just like in sections, inline parameters will not override the current context if a reference of the same name already exists.

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
