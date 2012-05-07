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

    <script src="dust-core-0.4.0.min.js"></script>

To compile a template on the command line, use the dustc command.
Its syntax is:

    dustc [{-n|--name}=<template_name>] {inputfilename|-} [<outputfilename>]

For example, to compile a template on the command line and have it
registered under the same name as the source file:

    $ dustc template.html

You can customize the name under which the template is registered:

    $ dustc --name=mytemplate template.html
    
**Support logic helper @if**
----------------------------

Dust supports the exists (?) and not exists (^?). Nested exists block easily allow for (exp1 AND exp2 AND exp3), but  (exp1 OR exp2 ) is not possible.@if helper comes handy in cases where an OR operation is required.

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

Global Aliases
----------------------

Most often we tend to reuse the same data in the template again and again ... One way to avoid been repetitive is use aliases. So a common question was, how does dust support this ?

Well, in dust there is more than one way neat way to do this.

*Use Inline Partials*

Inline partials never output content themselves, and are always global to the template in which they are defined, so the order of their definition has no significance.

Key points to note : They are global to the template., there is no ordering and can be defined anywhere

*Step 1* create global alias

     {<greeting}Hello, Hola{/greeting}   

*Step 2*

     {#names}
       {.} {+greeting/} 
     {/names}

     {#projects}
       {.} {+greeting/}
     {/projects}



Block Aliases
----------------------
Inline parameters appear within the section's opening tag. Parameters are separated by a single space.

     {#profile bar="baz" bing="bong"}
      {name}, {bar}, {bing}
     {/profile}

*There are 3 flavors*

    {#test greeting="hello"} // constant hello
     {greeting}
    {/test}

    {#test greeting=hello} // looks for a json context hello in the JSON hierarchy
     {greeting}
    {/test}

    {#test greeting="{hello}"} // resolves hello when greeting is referenced in the block and it resolves to the first one in the hierarchy
     {greeting}
    {/test}


Template Inheritance
----------------------------

Dust by default allows template inheritance with the concept of partials and inline partials

Example 1:
--------------------

*partial.tl  ( this serves as the base template )*

     
       {+greeting} Hola {/greeting}
       {+world} World {/world}


*main_without_override.tl  ( this serves as the child template )*


      {>partial/}

*output*

When the main_without_override.tl is rendered ...

  Hola
  World

main_with_override.tl  ( this serves as the child template )
-----------------

      {>partial/}
       {<greeting}
         Hello
       {/greeting}

*output*


When the main_with_override.tl  is rendered ...

  Hello
  World


*main_with_loops.tl*


      {>partial/}
       {#projects
         {<greeting}
           Hello {.name}
        {/greeting}
        {/projects}
        {<world}{/world} {! override to print nothing !}


*output*


When the main_with_loops.tl  is rendered ... ( says projects has three entries with the name field )

   Hello project 1
   Hello project 2
   Hello project 3
  
Example 2
---------------

*base.tl*

	    {+greeting}hello{/greeting}
	    {+world/}

*footer.tl*

      Common footer

*base_end.tl*


	    {>"footer"/}
	    {+bye} bye {/bye}


*main.tl*

	      {>"head"/}
	        BODY
	      {>"foot"/}

*head.tl*

	     {>"base"/}
	     {<world} World {/world}
	        START

*foot.tl*

	      END
	      {>"base"/}
	      {<greeting}bye{/greeting}

*foot_with_no_end.tl*

	      END
	      {>"base_end"/}
	      {<bye} {! Do not print bye | }{/bye}




*output ( when I render main.tl with foot.tl )*

hello World START  BODY  END bye


*output ( when I render main.tl with foot_with_no_end.tl )*

hello World START  BODY  END common footer


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



Dynamic Partials
----------------

The name of the partial can be determined at render time. Primarily useful when a partial is loaded based on the ab-test key.

{>"/path/{abkey}.tl"/}
