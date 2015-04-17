---
layout: docs
title: Template Syntax Reference
permalink: /docs/syntax/
---

<h3 id="reference"><code>{reference}</code></h3>

A reference is used to insert values from your context (or JSON data) into your template.

<pre><code>{<i>key</i>[|filter1|filterN]}</code></pre>

A reference is a single opening curly brace `{`, followed by a Dust path, optionally followed by one or more filters, followed by a single closing curly brace `}`.

A Dust path is one or more Dust keys, separated by dots (`.`).

A Dust key is one or more of the following characters: `a-z`, `A-Z`, `_` (underscore), `$`, `0-9`, or `-`

NOTE: The first character of a reference cannot be `0-9` or `-`.

<dust-demo templatename="reference">
<dust-demo-template showtemplatename="true">{name} is a valid Dust reference.{~n}
{0name} is not a valid Dust reference.{~n}
{.name} is a valid Dust reference.{~n}
{.} is a valid dust reference.{~n}
{markup|s}: The |s filter does not escape HTML.{~n}
{markup}: HTML is escaped by default.</dust-demo-template>
<dust-demo-json>{
  "name": "name",
  "0name": "0name",
  "markup": "&lt;span class=\"highlight\"&gt;Markup allowed&lt;/span&gt;"
}</dust-demo-json>
</dust-demo>

<h3 id="comment"><code>{! comments !}</code></h3>
A Dust comment is used in a template to include text that will be ignored when the template is rendered.

<pre><code>{! All Dust comments are
multiline comments !}</code></pre>

<dust-demo templatename="comments">
<dust-demo-template showtemplatename="true">Comments {! in Dust !}can be used for documentation.{~n}
Comments can also be used {! &lt;button&gt;Click me!&lt;/button&gt; !}to test or remove features.</dust-demo-template>
</dust-demo>

<h3 id="section"><code>{#section/}</code></h3>
A standard section is used to change what level of the context Dust uses to look up values. If the new context is an array, the standard section automatically loops through the array. If an `{:else}` body is used, its contents are output if the new context does not exist.

<dust-demo templatename="standard_section">
<dust-demo-template showtemplatename="true">{!
  Outside of the section, Dust looks for values
  at the root of the JSON context
!}
The value of name is: {name}{~n}
{#extraData}
  {!
    Inside this section, Dust looks for
    values within the extraData object
  !}
  Inside the section, the value of name is: {name}{~n}
{/extraData}
The value of name is: {name}, again.{~n}
{#nonExistentContext}
  This is only output if "nonExistentContext" exists.
{:else}
  Because "nonExistentContext" does not exist, the else body is output.
{/nonExistentContext}
</dust-demo-template>
<dust-demo-json>{
  "name": "Jimmy",
  "extraData": {
    "name": "Kate"
  }
}</dust-demo-json>
</dust-demo>

A section is a single opening curly brace `{`, followed by a hash `#`, followed by a Dust path, followed by a closing curly brace `}`, followed by some content, then a closing tag using the same Dust path.

Section with content:

<pre><code>{#<i>key</i>}
  Some content
{/<i>key</i>}
</code></pre>

Section with `{:else}` body:

<pre><code>{#<i>key</i>}
  Some content
{:else}
  Some other content, if <i>key</i> doesn't exist in the context.
{/<i>key</i>}
</code></pre>

Self-closing section (note: this doesn't do anything, but is technically valid Dust):

<pre><code>{#<i>key</i>/}</code></pre>

<h3 id="exists"><code>{?exists/}</code></h3>

An exists section is a special type of section that outputs its contents if the value it is referencing exists. The syntax for the exists section is the same as the standard section, but the `#` is replaced by a `?`. However, unlike the standard section, the exists section does not change the context.

<dust-demo templatename="exists">
<dust-demo-template showtemplatename="true">{?isReady}Ready!{:else}Wait a minute...{/isReady}</dust-demo-template>
<dust-demo-json>{
  "isReady": false
}</dust-demo-json>
</dust-demo>

<h3 id="not-exists"><code>{^not-exists/}</code></h3>

A not-exists section is a special type of section that outputs its contents if the value it is referencing __does not__ exist. The syntax for the not exists is the same as the standard section, but the `#` is replaced by a `^`. Unlike the standard section, the not exists section does not change the context.

<dust-demo templatename="not_exists">
<dust-demo-template showtemplatename="true">{^isReady}Not ready yet.{:else}I'm ready to go!{/isReady}</dust-demo-template>
<dust-demo-json>{
  "isReady": false
}</dust-demo-json>
</dust-demo>

<h3 id="helper"><code>{@helper/}</code></h3>
A helper is special kind of section that executes some JavaScript when it is rendered. For more information on using helpers, see the [Dust helpers guide](/guides/dust-helpers). For more information on writing Dust helpers, see the [writing helpers guide](/guides/writing-helpers).

<dust-demo templatename="helper">
<dust-demo-template showtemplatename="true">The answer is {@eq key=answer value=42}42{:else}wrong{/eq}.</dust-demo-template>
<dust-demo-json>{
  "answer": 42
}</dust-demo-json>
</dust-demo>

<h3 id="inline-partial"><code>{&lt;inline-partial/}</code></h3>
An inline-partial is an inert piece of Dust that can be inserted in one or more places in a Dust template. An inline-partial is inserted using a block. For example use cases of inline-partials and blocks, see the [base and override templates guide](/guides/base-and-override-templates).

An inline-partial is defined as a single opening curly brace `{`, follwed by a less than sign `&lt;`, followed by a name (with the same characters allowed in a Dust key), followed by a single closing curly brace `}`, followed by some content, followed by a closing tag.

```
{<classNames}primary hero{/classNames}
```

A self-closing block is defined as a single opening curly brace `{`, followed by a plus sign `+`, followed by the name used in the inline-partial, followed by a forward slash and single closing curly brace `/}`. Alternatively, a block can have content. A block's content is output only if a matching inline-partial is not found. For more info, see the [base and override templates guide](/guides/base-and-override-templates).

<dust-demo templatename="inline_partial">
<dust-demo-template showtemplatename="true">{+greeting}Hello!{/greeting} world.
{&lt;greeting}Howdy{/greeting}
</dust-demo-template>
<dust-demo-json>{}</dust-demo-json>
</dust-demo>

<h3 id="partial"><code>{&gt;partial/}</code></h3>

A partial is used to include one dust template inside of another dust template.

A partials is a single opening brace `{`, followed by a greater than symbol `&gt;`, followed by the name of the template to be included (the name may need to be surrounded by quotes if it includes characters outside of the set used by [references](#reference)), optionally followed by parameters, followed by a forward slash `/`, followed by a single closing brace.

Basic example:

```
{>my_template/}
```

With parameters:

```
{>my_template_with_params foo="bar" contacts=friends/}
```

<dust-demo templatename="partial">
<dust-demo-template showtemplatename="true">You want to know if I'm ready? {&gt;exists/}</dust-demo-template>
<dust-demo-json>{
  "isReady": "totally"
}</dust-demo-json>
</dust-demo>

<h3 id="special"><code>{~special}</code></h3>

A special is converted to a special character

A special is a single opeing curly brace `{`, followed by a tilde `~`, follwed by any of the characters in a [reference](#reference), followed by a single closing curly brace `}`. Dust supports five "specials":

- `{~s}` becomes a single space
- `{~n}` becomes a new line
- `{~r}` becomes a carriage return
- `{~lb}` becomes a left curly brace `{`
- `{~rb}` becomes a right curly brace `}`

<dust-demo templatename="special">
<dust-demo-template showtemplatename="true">You{~s}can{~s}add{~s}spaces{~s}and{~n}new-lines with Dust specials.{~n}{~n}Curly braces that are usually reserved for {~lb}dust{~rb} syntax can be created with Dust specials, too.</dust-demo-template>
<dust-demo-json>{}</dust-demo-json>
</dust-demo>
