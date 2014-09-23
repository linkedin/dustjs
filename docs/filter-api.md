---
layout: docs
title: Dust Syntax
permalink: /docs/filter-api/
---

##Dust Filters
###Function definition
    
    dust.helpers.myFilter = function(value) {
      /* Modify the value */
      return value; 
    }
    
###Parameters
* value: The value that is used in the dust reference.
* @return {String} The modified value

###Filter call

    {myReference|myFilter}    
