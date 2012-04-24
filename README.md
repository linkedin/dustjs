Dust  [![Build Status](https://secure.travis-ci.org/linkedin/dustjs.png)](http://travis-ci.org/linkedin/dustjs)
====

Demo & Guide
------------
ß
Extensive docs and a full demo are available at <http://akdubya.github.com/dustjs>


> Asynchronous templates for the browser and node.js

#### <http://akdubya.github.com/dustjs> #

Highlights!
----

I like [Mustache](http://mustache.github.com) and variants but none of them offers quite what I need.

Use Dust if you want these things:

* async/streaming operation
* browser/node compatibility
* extended Mustache/ctemplate syntax
* clean, low-level API
* [high performance](http://akdubya.github.com/dustjs/benchmark/index.html)
* composable templates


This is the LinkedIn fork of dust.js
====================================

Details in the blog post : http://engineering.linkedin.com/frontend/leaving-jsps-dust-moving-linkedin-dustjs-client-side-templates

We will gradually be extending this library with helper functions and bug fixes. 

Current LinkedIn additions include:
--------------------------

* Fix to peg.js to print the line and column number for syntax errors in dust templates
* Fix to support > node0.4 
* Addition of jasmine test suite, BDD with dust.js 
* There are cases of rendering logic that are best done in templates. @if helper that relies entirely on the js eval for expression evaluation, The perf results are here: <http://jsperf.com/dust-if>. We intend to replace the slow js eval with a expression parser soon 
* Section index for lists of maps stored in the dust context for ease of writing simple logic in templates
* Section size for lists of maps stored in the dust context for ease of  writing simple logic in templates

Installation
------------

For Linkedin Dustjs

    $ npm install dustjs-linkedin

To render compiled templates in the browser:

    <script src="dust-core-0.3.0.min.js"></script>