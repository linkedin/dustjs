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


**Support logic helper @if**
----------------------------
*Example 1:*

     {@if cond="('{x}'.length || '{y}'.length ) || (2 > 3) && {a}-{b} == 9"}
      render if
     {:else}
      render else
     {/if}

**Section index for lists of maps stored in the dust context**
---------------------------------------------------

*Example 2: $idx is the Loop index in dust #loop*

    {#people}
    <li class="card  
     {@if cond="({$idx} == {$len})"}last{/if}" data-member-id="{id}"  id="card-{id}">
     </li>
    {/people}

**Section size for lists of maps stored in the dust context**
----------------------------------------

*Example 3: $len, Loop size in dust #loop*

    {#people} 
    <li class="card  {@if cond="({$len} + 1) % 2 == 0"} odd {:else} even {/if} " data-member-id="{id}"  id="card\-{id}"> </li> 
    {/people}

*Example 4: Inside lists of primitives,$idx and $len cannot be used, and {@idx} can be used instead*

    JSON : {"skills": ["jasmine", "qunit", "javascript"]}
    {#skills}
     <li>
     <span class='{@idx}
      {@if cond="{.} == '{skills}'.split(',').length -1"}
        last
      {/if}
     {/idx}'>
     {.}</span> 
     </li>
    {/skills}

*Example 5: @if with else*   

    {@if cond="'{names}'.split(',').length == 3 "}
     {@pre.i18n key="yes" text="Yes, there are 3 names"/} 
    {:else}
     {@pre.i18n key="no" text="No, there are less than 3 names"/}
    {/if}
