---
title: Tips and Tricks
layout: guides
permalink: /guides/tips-and-tricks/
---

## Logic

The [Dust core logic helpers](https://github.com/linkedin/dustjs-helpers) provide basic logic for templates that most apps will need. The helpers include logical comparisons (equal, less than, greater than), simple math operations, [and more](/guides/dust-helpers).

Although Dust is not completely logicless, so that you can get around some basic hurdles, it is still wise not to bloat templates with too much "business logic." If there's too much logic in a Dust template, it will be hard to read and hard to maintain. This will just increase the difficulty of maintaining your template. Let the server handle the business logic, or write [context helpers](/guides/context-helpers) to move logic out of your templates.

## Debugging

Debugging can be turned on by setting `dust.debugLevel` to "DEBUG", "INFO", "WARN", or "ERROR" before you render the template.

  * "DEBUG" will not filter out any log messages, while every level above will filter out logs below them in severity.
  * "DEBUG" and "INFO" messages may help you debug behavior in your templates, but are safe to ignore.
  * "WARN" messages notify you of possibly-unintended behavior that will not cause your template rendering to fail.
  * "ERROR" messages are fatal and signify that your template render has failed.
  * During development, turn logging to "WARN" or "INFO" to help catch problems with your templates.

```js
if (process.env.NODE_ENV === 'development') {
  dust.debugLevel = "INFO";
}
```

When running a Node app via the command line, you can set the environment variable `DEBUG` to `dust` to automatically turn on debugging.

```
$ DEBUG=dust node app.js
```

## Linting

You can run [Swiffer](https://github.com/smfoote/Swiffer.js), the Dust linter, to get warnings about possible security holes, parse errors, and coding-style guidelines.
