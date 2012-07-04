Dust  [![Build Status](https://secure.travis-ci.org/linkedin/dustjs.png)](http://travis-ci.org/linkedin/dustjs)
====

Demo & Guide
------------
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
* Automated Travis CI integration, jasmine for BDD, code coverage report
* Extend grammar to relax whitespace/eol 
* Add support for rhino in the dust core
* improve compile times by 10X with changes to how we use peg parser
* Extend filters for JSON.stringify and JSON.parse
* logic helpers for select/ switch
* Support numbers in dust inline params
* Extend partials to support inline params
* Support for array references, hence list elements can be accessed via the [] notation
* Support dynamic blocks, similar to dynamic partials
* Add pipe support for node
* Documentation/wiki on the best practices for using dustjs


Installation
------------

For Linkedin Dustjs

    $ npm install dustjs-linkedin

To render compiled templates in the browser:

    <script src="dust-core-1.0.0.min.js"></script>

To compile a template on the command line, use the dustc command.
Its syntax is:

    dustc [{-n|--name}=<template_name>] {inputfilename|-} [<outputfilename>]

For example, to compile a template on the command line and have it
registered under the same name as the source file:

    $ dustc template.html

You can customize the name under which the template is registered:

    $ dustc --name=mytemplate template.html

Running Tests
------------

To run tests:

    $ make test

To generate code coverage report:

    $ npm install cover -g
    $ make coverage
    
To view HTML test coverage report:

    $ open cover_html/index.html
