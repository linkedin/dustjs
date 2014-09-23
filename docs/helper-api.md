---
layout: docs
title: Dust Syntax
permalink: /docs/helper-api/
---

##Dust Helpers
###Function definition

    dust.helpers.myHelper = function(chunk, context, bodies, params) {
       /* Crazy logic here */
    }

###Parameters
* chunk:  the currently accumulating output of the template render process. You will most likely contribute additional output as part of your helper.
* context: the current context stack (e.g that which changes when you do things like {#list}
* bodies: holds any body sections nested within the helper. For example, the {:else) body.
* params is an object that holds all the parameters used when calling the custom helper.
* @return: {Void}

###Helper call
####Example with params:

    {@myHelper param1="1" param2="{reference}" /}

####Example with params and bodies:

    {@myHelper param1="1" param2="{reference}"}
      {! bodies !}
    {/myHelper}
