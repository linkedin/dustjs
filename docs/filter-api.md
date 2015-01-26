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

###Example

In this example, we will define an javascript filter, which takes a string and returns another string that is safe to use in javascript by escaping special javascript characters.

#### Javascript definition of a JSON filter
```
var BS = /\\/g,
    FS = /\//g,
    CR = /\r/g,
    LS = /\u2028/g,
    PS = /\u2029/g,
    NL = /\n/g,
    LF = /\f/g,
    SQ = /'/g,
    DQ = /"/g,
    TB = /\t/g;

dust.filters.javascript = function(value) {
   if (typeof value === 'string') {
      return value
        .replace(BS, '\\\\')
        .replace(FS, '\\/')
        .replace(DQ, '\\"')
        .replace(SQ, '\\\'')
        .replace(CR, '\\r')
        .replace(LS, '\\u2028')
        .replace(PS, '\\u2029')
        .replace(NL, '\\n')
        .replace(LF, '\\f')
        .replace(TB, '\\t');
    }
    return value;
  };
```

#### javascript filter usage in a dust template
```
  {myReference|javascript}
```