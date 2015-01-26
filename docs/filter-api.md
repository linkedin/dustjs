---
layout: docs
title: Dust Syntax
permalink: /docs/filter-api/
---
##Dust Filters
###Filter call

```
{myReference|myFilter}    
````

###Function definition
```    
dust.filters.myFilter = function(value) {
  /* Modify the value */
  return value; 
}
``` 
###Parameters
* value: The value that is used in the dust reference.  This is the left hand argument in the filter call above.
* @return {String} The modified value