---
title: Dust.js | Blocks and Inline Partials
layout: guides
permalink: /guides/blocks/
---

# Blocks and Inline Partials

An important need in developing a multi-page web application is to have common elements of the pages defined just once and shared by all pages (<a href="http://en.wikipedia.org/wiki/Don%27t_repeat_yourself\" target="_blank">DRY - Don't repeat yourself</a>). Dust provides this with the concept of blocks and inline partials. Consider a common case where several pages share a header and footer but have different body content.

Blocks in the base template can contain default content and a child template can override that content.

```
{+name}default Content{/name}.
```

In the following example, the base template has three blocks: `pageHeader`, `bodyContent`, and `pageFooter`. The `pageHeader` and `pageFooter` have default content that is shown if the child template does not override them.  You'll notice below that without a child template, the base template renders the default header and footer content, but no body content.

<dust-demo template-name="base-template">
<dust-demo-template>&lt;div class=&quot;page&quot;&gt;
  &lt;h1&gt;{+pageHeader}LinkedIn{/pageHeader}&lt;/h1&gt;
  &lt;div class=&quot;bodyContent&quot;&gt;
    {+bodyContent/}
  &lt;/div&gt;
  &lt;div class=&quot;footer&quot;&gt;
    {+pageFooter}
       &lt;a href=&quot;/contactUs&quot;&gt;Contact Us&lt;/a&gt;
    {/pageFooter}
  &lt;/div&gt;
&lt;/div&gt;
</dust-demo-template>
<dust-demo-json>{}</dust-demo-json>
</dust-demo>


Now that we have defined a base template with the named blocks pageHeader, bodyContent, pageFooter, let's look at how a child template can use it to supply body content and override the pageFooter. First, insert the base template as a partial. Then use one or more "inline partials" defining the values for the named blocks in the template. You'll see in the example below that we override the `bodyContent` block and the `pageFooter` block. The `pageHeader` block is not overridden, so it shows its default content.

<dust-demo template-name="child-template">
<dust-demo-template>{! First, insert the base template as a partial !}
{&gt;&quot;base-template&quot;/}
{&lt;bodyContent}
&lt;p&gt;Your body content&lt;/p&gt;
{/bodyContent}
{&lt;pageFooter}
       This is a NEW footer
{/pageFooter}
</dust-demo-template>
<dust-demo-json>{}</dust-demo-json>
</dust-demo>

**Warning**: inline partials' names are global to that template chain.

```
{<name}xxx{/name}
{+name/}

...
{! Oops! {+name/} above will be 'zzz' !}
{<name}zzz{/name}
```

Only use generic names for inline partials with the knowledge that a template later in the chain can override it.
