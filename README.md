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

Dust Helpers
------------

Support logic helper @if
-------------------------

Example 1: 

{@if cond="('{x}'.length || '{y}'.length ) || (2 > 3) && {a}-{b} == 9"}
      render if
  {:else}
      render else
{/if}

Example 2: @if inside the loop# section

With {@if} helper and  {@idx} helper

{#people}
<li class="card {@idx} {@if cond="({.} + 1) % 2 == 0"} last {:else} first {/if} {/idx}" data-member-id="{id}"  id="card-{id}"></li>
{/people

With {@if} helper and the {$idx}

{#people}
 <li class="card  {@if cond="({$idx} == {$len}-1)"} last {/if} " data-member-id="{id}"  id="card-{id}"> </li>
{/people}


Example 3: Support exists check in the @if helper 

{@if cond="({{x}} || {{y}}) || (2 > 3) && {a}-{b} == 9"}
  You
{:else}
  Me
{/if}


{#people}

<li class="card  {@if cond="({$len} + 1) % 2 == 0"} odd {:else} even {/if} " data-member-id="{memberID}"  id="card\-{memberID}">

</li>

{/people}

{code}

{info} The $idx and $len will only work with *maps* and does not  work within arrays , please use the @idx helper in that case, we think such cases will be rare{info}

h3. here is a example it works

sample JSON

{code}
{
    "fronttest_mapper_two": {
        "items": [{
            "item": "pen"
        }, {
            "item": "pencil"
        }, {
            "item": "flower"
        }],
        "test": "TEST"
    },
}
{code}

{code}
Rendering items in a map
-------------------------------------------------------

{! items is a map !}
{?items}
  <div>
    <ol class="items" id="items-list">  
    {#items}
      <li>
       {$idx}
       {$len}
            <span class='{@if cond="{$idx} == {$len}-1"}last{/if}'>{.item}</span>     
                  {@if cond="{$idx} == {$len}-1"}last{/if}
                  {@if cond="{$idx} == {$len}-1"}last{:else} not last{/if}
      </li>
    {/items}                    
    </ol>
  </div>
{/items}


OUTPUT

Rendering items in a map

---------------------------

    0 3 pen
    1 3 pencil
    2 3 last flowe
{code}

h3. here is example $idx and $len will *not work*

{code}

    "fronttest_mapper_two": {
        "brands": ["b1", "b2", "b3"],
      
    }
{code}

How to make it work? Use the @idx helper
{code}
{! brand is a list !}
{?brands}
  <div>
    <ol>  
    {#brands size="3"}
      <li>
      <span class='{@idx} {.}{@if cond="{.} == {size} -1"} last {/if}{/idx}'>{.}</span> 
      {@idx} {.}{@if cond="{.} == {size} - 1"} last {/if}{/idx}
      </li>
    {/brands}                    
    </ol>
  </div>
{/brands}

OUTPUT

Rendering brands in a list-------------------------------------------------------

    b1 0
    b2 1
    b3 2 last
{code}




