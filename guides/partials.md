---
title: Dust.js | Partials
layout: guides
permalink: /guides/partials/
---

# Partials

A Dust partial promotes "DRY" behavior for reusable/shared markup. Templates can include other templates using the `{>partial}` tag. When a partial is included, it has access to the parent template's context.

Templates commonly make use of partials to include shared code such as headers and footers.

Like sections, partials accept parameters, so you can build reusable components that are parameterizable easily. By passing data into a partial using parameters, the partial can render independent of its parent context.

```
{>header theme="classic" /}

Sign up for the newsletter: {>"signup-form" action="/newsletter" /}

{>footer/}
```

Just like in sections, inline parameters will not override the current context if a property of the same name exists. For example, if the current context already has `{name: "Albert"}` adding `name` as a parameter will not override the value when used inside the partial foo.

```
{>foo name="will not override Albert"/}
```

You can also pass entire objects to partials.

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
