---
title: Setup
layout: guides
permalink: /guides/setup/
---

# Installing Dust

## npm

To install as a Node module:

```bash
npm install --save --production dustjs-linkedin

# If you want the core helpers addon
npm install --save --production dustjs-helpers
```

Dust should work with any version of Node or io.js newer than 0.8.12.

The command-line compiler is located at `./node_modules/.bin/dustc`. To make the compiler available globally, run `npm install` with the `-g` flag.

## Bower

To install using Bower:

```bash
bower install dustjs-linkedin
```

Dust is compatible with IE7+ and all modern browsers.

## Download

You can manually download current and past versions of Dust on the [GitHub releases page](https://github.com/linkedin/dustjs/releases).

# Loading Dust

## Node

```
var dust = require('dustjs-linkedin');
```

## Browser

Include `dust-core.min.js` or `dust-full.min.js` on your page. If you will be compiling templates in the browser, use `dust-full.min.js`.

## AMD

As of Dust 2.6.0, you can load Dust using an AMD-compatible loader such as require.js.

To maintain backwards compatibility, you must enable a config flag to tell Dust to register itself as a named AMD module ([in the same way jQuery works](http://requirejs.org/docs/jquery.html)).

    define.amd.dust = true;

After you've done this, you can load `dust-core.js` or `dust-full.js` as a module.

    <script src="r.js"></script>
    <script type="text/javascript">
        define.amd.dust = true;
        require(["lib/dust-full"], function(dust) {
            dust.render(...);
        });
    </script>

### Helpers

If you are using `dustjs-helpers` 1.6.0 or newer, the helpers also register themselves as an anonymous AMD module. It seems to work best if you require the helpers after Dust has already been loaded.

```js
define.amd.dust = true;
require(["lib/dust-full"], function(dust) {
  require(["lib/dust-helpers"], function() {
    // dust helpers are available when you call dust.render()
  });
});
```
