Dust
====

This is the LinkedIn fork of dust.js
-------------------------------------
Details in the blog post : http://engineering.linkedin.com/frontend/leaving-jsps-dust-moving-linkedin-dustjs-client-side-templates

We will gradually be extending this library with helper functions and bug fixes. 

Current additions include:
* Fix to peg.js to print the line and column number for syntax errors in dust templates
* Addition of jasmine test suite, BDD with dust.js
* @if helper that relies entirely on the js eval for expression evaluation
* Section index for lists of maps stored in the dust context for ease of writing simple logic in templates
* Section size for lists of maps stored in the dust context for ease of  writing simple logic in templates


> Asynchronous templates for the browser and node.js

#### <http://akdubya.github.com/dustjs> #

Why?
----

I like [Mustache](http://mustache.github.com) and variants but none of them offers quite what I need.

Use Dust if you want these things:

* async/streaming operation
* browser/node compatibility
* extended Mustache/ctemplate syntax
* clean, low-level API
* [high performance](http://akdubya.github.com/dustjs/benchmark/index.html)
* composable templates

Composable templates?
---------------------

    {^xhr}
      {>base_template/}
    {:else}
      {+main/}
    {/xhr}
    {<title}
      Child Title
    {/title}
    {<main}
      Child Content
    {/main}

Installation
------------

In Node:

    $ npm install dust

To render compiled templates in the browser:

    <script src="dust-core-0.3.0.min.js"></script>

Demo & Guide
------------
ß
Extensive docs and a full demo are available at <http://akdubya.github.com/dustjs>

