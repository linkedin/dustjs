---
title: DustJS | Getting Started
layout: guides
permalink: /guides/getting-started/
---

# Getting Started

Welcome to Dust! The exercises in this tutorial will help you get familiar with Dust's core features and syntax. To complete the exercises, edit the "Dust Template" or "Data" so that the "Output" matches the "Expected Output".

## Writing Templates

### References
The first thing to learn is how to reference your data using Dust. You will learn below how to tell Dust what data to use, but for now the exercises will handle that for you. A reference in Dust is written by surrounding a JSON key with a single set of curly braces (`{key}`). In the introductory exercise below, we welcome you to Dust, but the greeting is a bit too formal.

<dust-tutorial template-name="intro">
<dust-demo-template>Welcome to Dust, {name}.</dust-demo-template>
<dust-demo-json>{
  "name": "friend",
  "familiarName": "pal"
}</dust-demo-json>
<dust-tutorial-answer>Welcome to Dust, pal.</dust-tutorial-answer>
</dust-tutorial>

### References with dot-notation (AKA paths)
If you need to reference values within nested objects, you can use dot-notation the same way you would in JavaScript.

<dust-tutorial template-name="dot_notation">
<dust-demo-template>Hello, {name}</dust-demo-template>
<dust-demo-json>{
  "name": "Ned",
  "amigo": {
    "name": "Dusty"
  }
}</dust-demo-json>
<dust-tutorial-answer>Hello, Dusty</dust-tutorial-answer>
</dust-tutorial>

Learn more about [Dust References](/docs/syntax#reference).

### Conditionals
Dust can include content conditionally with `?` (exists) and `^` (not exists). Given a reference, the conditionals check if the value of that reference is truthy or falsy, then output the content accordingly. See the [conditionals syntax documentation](/docs/syntax#exists) for more information on what is truthy and what is falsy in Dust.

<dust-tutorial template-name="reference">
<dust-demo-template>&lt;input type="checkbox"{^isSelected} selected{/isSelected}&gt;</dust-demo-template>
<dust-demo-json>{
  isSelected: true
}</dust-demo-json>
<dust-tutorial-answer>&lt;input type="checkbox" selected&gt;</dust-tutorial-answer>
</dust-tutorial>

You can also use an `{:else}` statement with conditionals.

<dust-tutorial template-name="reference">
<dust-demo-template>&lt;li class="result{?isPrimary} primary{:else} {/isPrimary}"&gt;</dust-demo-template>
<dust-demo-json>{
  isPrimary: false
}</dust-demo-json>
<dust-tutorial-answer>&lt;li class="result secondary"&gt;</dust-tutorial-answer>
</dust-tutorial>

### Sections

Sections, which work a lot like conditionals, are a useful alternative to the sometimes verbose dot-notation. A section is used to switch the context in which Dust looks up references. In the example below, the section begins with `{#friend}` and ends with `{/friend}`. While inside of the `{#friend}` section, Dust looks for references inside of the `friend` object. That's why the output is `Hello, John` instead of `Hello, Jacob`.

<dust-tutorial template-name="section">
<dust-demo-template>Hello, {#friend}{name}{/friend}.</dust-demo-template>
<dust-demo-json>{
  "name": "John",
  "nickname": "Jingleheimer Schmidt",
  "friend": {
    "name": "Jacob"
  }
}</dust-demo-json>
<dust-tutorial-answer>Hello, John Jacob.</dust-tutorial-answer>
</dust-tutorial>

However, if Dust doesn't find a reference in a given context, it will look into all of the data's parent contexts before it gives up.

<dust-tutorial template-name="reference-lookup">
<dust-demo-template>Hello, {name} {#friend}{name} [[ PUT YOUR ANSWER HERE ]]{/friend}. That's my name, too.</dust-demo-template>
<dust-demo-json>{
  "name": "John",
  "nickname": "Jingleheimer Schmidt",
  "friend": {
    "name": "Jacob"
  }
}</dust-demo-json>
<dust-tutorial-answer>Hello, John Jacob Jingleheimer Schmidt. That's my name, too.</dust-tutorial-answer>
</dust-tutorial>

### Looping

Looping in Dust is easy. In fact, a loop is just a section where the reference of the section is an array.

You can use `{.}` to reference the current item in the loop. Below is an example of an array of strings.

<dust-tutorial template-name="loop">
<dust-demo-template>&lt;ul&gt;
  {#languages}&lt;li&gt;[[ YOUR CODE GOES HERE ]]&lt;/li&gt;{/languages}
&lt;/ul&gt;</dust-demo-template>
<dust-demo-json>{
  "languages": [
    "HTML",
    "CSS",
    "JavaScript",
    "Dust"
  ]
}</dust-demo-json>
<dust-tutorial-answer>&lt;ul&gt;&lt;li&gt;HTML&lt;/li&gt;&lt;li&gt;CSS&lt;/li&gt;&lt;li&gt;JavaScript&lt;/li&gt;&lt;li&gt;Dust&lt;/li&gt;&lt;/ul&gt;</dust-tutorial-answer>
</dust-tutorial>

You can use key value references when the array contains objects. Below is an example of an array of objects (with an array inside).

<dust-tutorial template-name="loop">
<dust-demo-template>&lt;ul&gt;
  {#languages}
    &lt;li&gt;[[ INSERT LANGUAGE NAME HERE ]] by {#creators}{.}{@sep} and {/sep}{/creators}&lt;/li&gt;
  {/languages}
&lt;/ul&gt;</dust-demo-template>
<dust-demo-json>{
  "languages": [
    {
      "name": "HTML",
      "creators": ["Tim Berners Lee"]
    },
    {
      "name": "CSS",
      "creators": ["Håkon Wium Lie", "Bert Bos"]
    },
    {
      "name": "JavaScript",
      "creators": ["Brendan Eich"]
    },
    {
      "name": "Dust",
      "creators": ["akdubya"]
    }
  ]
}</dust-demo-json>
<dust-tutorial-answer>&lt;ul&gt;&lt;li&gt;HTML by Tim Berners Lee&lt;/li&gt;&lt;li&gt;CSS by Håkon Wium Lie and Bert Bos&lt;/li&gt;&lt;li&gt;JavaScript by Brendan Eich&lt;/li&gt;&lt;li&gt;Dust by akdubya&lt;/li&gt;&lt;/ul&gt;</dust-tutorial-answer>
</dust-tutorial>

## Compiling Dust Templates
Dust templates are compiled to JavaScript. A template is compiled using `dust.compile`. Templates can also be compiled from the command line using `dustc` (which calls `dust.compile` internally).

Compiling with `dust.compile`:

```javascript
var compiledTemplateString = dust.compile('My {template}', 'myTemplate');
```

Compiling with [`dustc`](/docs/dustc-api/):

```bash
local-user $ dustc
```

## Serving Dust Templates
Save your compiled Dust template as a JavaScript file, and serve it how you normally serve JavaScript files:

```html
<script src="/static/tl/myTemplate.js"></script>
```

## Rendering Dust Templates

```javascript
dust.render('myTemplate', {template: 'AWESOME'}, function(err, output) {
  var el = document.getElementById('content-container');
  el.innerHTML = output;
});
```
