Dust
====

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

Extensive docs and a full demo are available at <http://akdubya.github.com/dustjs>

------------

How to run the unit-tests?

I this project we have the distributions of dust, the client and the nodejs version.
If you want to run the client version just open the html page called specRunner.html located on "test/client/specRunner.html".

In order to run the server distribution of dust, run this command in the terminal: "node test/server/specRunner.js" 

pre-requisites for server version: 
----------------------------------
* install nodejs 0.6 or greater 
* install npm
* install jasmin test framework (npm install -g jasmine-node)









