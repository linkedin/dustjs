---
title: DustJS | Getting Started
layout: guides
permalink: /guides/getting-started/
---

#Getting started

Welcome to Dust! Dust is an asynchronous templating engine that is used primarily for creating HTML.

<dust-demo template-name="reference">
<dust-demo-template>Welcome to Dust, {user.name}.</dust-demo-template>
<dust-demo-json>{
  "user": {
    "name": "John",
    "nickname": "Johnny boy"
  }
}</dust-demo-json>
</dust-demo>

##Installing Dust

You have a few options when it comes to downloading and installing Dust. The easiest are [npm](https://www.npmjs.org/) and [bower](http://bower.io/).

###npm

To install as a Node module:

```
npm install -g dustjs-linkedin
```

or, if you don't want the command-line tool (<code>dustc</code>) for compiling templates:

```
npm install dustjs-linkedin
```

###Bower
To install using Bower:
```
bower install dustjs-linkedin
```

###Download
The latest version of Dust is available on the GitHub <a target="_blank" href="https://github.com/linkedin/dustjs/tree/master/dist">page</a> (or <a target="_blank" href="">past versions</a>).

###git clone
You can clone the [Dust project repository](https://github.com/linkedin/dustjs), but then you will have to manage updates and dependencies on your own.

```
git clone https://github.com/linkedin/dustjs.git
```

##Writing Dust Templates

Alright, now that you have Dust, let's write some Dust templates. The most basic (and important) features of Dust are references, sections, loops, and conditionals.

###References

A Dust reference is a key surrounded by curly braces (no need for double curly braces). If the key is found in your data, the value related to that key will be output.

<dust-demo template-name="reference">
<dust-demo-template>Hello, {name}</dust-demo-template>
<dust-demo-json>{
  "name": "Dust"
}</dust-demo-json>
</dust-demo>

###References with dot-notation (AKA paths)
If you need to reference values within nested objects, you can use dot-notation the same way you would in JavaScript. A single dot is a reference to the current context (see the looping section below for an example).

<dust-demo template-name="dot_notation">
<dust-demo-template>Hello, {user.name}</dust-demo-template>
<dust-demo-json>{
  "user": {
    "name": "Dust"
  }
}</dust-demo-json>
</dust-demo>

###Conditionals
Dust can include content conditionally with `?` (exists) and `^` (not exists). Given a reference, the conditionals check if the value of that reference is truthy or falsy. The example below should clear up what is truthy and what is falsy.

<dust-demo template-name="reference">
<dust-demo-template>{?name}Hello, {name}{/name}
{?friend.name}Hello, {friend.name}{/friend.name}
{?zero}Zero is <b>not</b> falsy{/zero}
{^emptyString}Empty string is falsy{/emptyString}
{?emptyArray}Empty array is falsy. This won't show up{/emptyArray}
{^emptyArray}Unlike JavaScript, empty array is falsy{/emptyArray}
{^nonexistentKey}If a key is not found, its value is falsy{/nonexistentKey}</dust-demo-template>
<dust-demo-json>{
  "name": "Jacob",
  "friend": {
    "name": "John",
    "nickname": "Jingleheimer Schmidt"
  },
  "zero": 0,
  "emptyString": "",
  "emptyArray": []
}</dust-demo-json>
</dust-demo>

###Sections

Sections, which work a lot like conditionals, are a useful alternative to the sometimes verbose dot-notation. A section is used to switch the context in which Dust looks up references. In the example below, the section begins with <code>{#friend}</code> and ends with <code>{/friend}</code>. While inside of the <code>{#friend}</code> section, Dust looks for references inside of the <code>friend</code> object. That's why the output is <code>Hello, John</code> instead of <code>Hello, Jacob</code>.

<dust-demo template-name="reference">
<dust-demo-template>Hello, {#friend}{name} {nickname}.{/friend}</dust-demo-template>
<dust-demo-json>{
  "name": "Jacob",
  "friend": {
    "name": "John",
    "nickname": "Jingleheimer Schmidt"
  }
}</dust-demo-json>
</dust-demo>

###Looping

Looping in Dust is easy. You use the same syntax you do with sections. Instead of switching the context of a new object, when Dust notices that your section is an array, it loops through each item in that array.

Use <code>{.}</code> to reference the current item. Below is an example of an array of strings.

<dust-demo template-name="loop">
<dust-demo-template>&lt;ul&gt;
  {#languages}
    &lt;li&gt;{.}&lt;/li&gt;
  {/languages}
&lt;/ul&gt;</dust-demo-template>
<dust-demo-json>{
  "languages": [
    "HTML",
    "CSS",
    "JavaScript",
    "Dust"
  ]
}</dust-demo-json>
</dust-demo>

You can use key value references when the array contains objects. Below is an example of an array of objects (with an array inside).

<dust-demo template-name="loop">
<dust-demo-template>&lt;ul&gt;
  {#languages}
    &lt;li&gt;{name} by {#creators}{.}{@sep} and{/sep}{/creators}&lt;/li&gt;
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
</dust-demo>

##Compiling Dust Templates
Dust templates are compiled to JavaScript. A template is compiled using `dust.compile`. Templates can also be compiled from the command line using `dustc` (which calls `dust.compile` internally).

Compiling with `dust.compile`:

```javascript
var compiledTemplateString = dust.compile('My {template}', 'myTemplate');
```

Compiling with [`dustc`](/docs/dustc-api/):

```bash
local-user $ dustc
```

##Serving Dust Templates
Save your compiled Dust template as a JavaScript file, and serve it how you normally serve JavaScript files:

```html
<script src="/static/tl/myTemplate.js"></script>
```

##Rendering Dust Templates

```javascript
dust.render('myTemplate', {template: 'AWESOME'}, function(err, output) {
  var el = document.getElementById('content-container');
  el.innerHTML = output;
});
```
