---
layout: docs
title: Filter API
permalink: /docs/filter-api/
---
## Dust Filters

### Filter call

```
{myReference|myFilter}
````

### Function definition
```
dust.filters.myFilter = function(value) {
  /* Modify the value */
  return value;
}
```

### Parameters
* value: The value that is used in the dust reference.  This is the left hand argument in the filter call above.

### Return Value
* {String} The modified value

### Example
In this example, we will define a 'unicorn' filter, which takes a string and replaces all instances of the word "unicorn" with "horse", because we don't believe in unicorns.

#### JavaScript definition of a Unicorn filter
```
dust.filters.unicorn = function(value) {
   if (typeof value === 'string') {
      return value.replace('unicorn', 'horse');
    }
    return value;
  };
```

#### Unicorn filter usage in a dust template
```
{! JSON context: {
    myInput: 'I love unicorns'
   }
!}
{myInput|unicorn}
{! outputs 'I love horses' !}
```
