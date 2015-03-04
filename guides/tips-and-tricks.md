---
title: Dust.js | Tips and Tricks
layout: guides
permalink: /guides/tips-and-tricks/
---

# Tips and Tricks

* There are a set of basic <a href="https://github.com/linkedin/dustjs-helpers" target="_blank">core helpers</a> available to include in your project.  These are generally for basic logic like checking if two values are equivalent and other types of comparisons (greater than, less than).
* Although Dust is not completely logicless, so that you can get around some basic hurdles, it is still wise not to bloat templates with too much "business logic."  Business logic is essentially the way the data is stored.  If there's too much logic in a Dust template, it will be hard to read and hard to maintain.  Additionaly, you will eventually hit up against a wall with the amount of logic that Dust can handle, and will end up writing an endless number of helper functions to shoehorn your use case in.  This will just add to the difficulties in maintaining the template.  Let the server handle the business logic.
* Debugging can be turned on by setting `dust.debugLevel` to "DEBUG", "INFO", "WARN", or "ERROR" before you render the template.
  * "DEBUG" will not filter out any log messages, while every level above will filter out logs below them in severity.
  * It is useful to set dust.debugLevel to "DEBUG" in your testing environment, and either to "ERROR" or unset in your production environment.
* You can run <a href="https://github.com/smfoote/Swiffer.js" target="_blank">Swiffer</a>, the Dust linter, to get warnings about possible security holes, parse errors, and coding style guidelines.
