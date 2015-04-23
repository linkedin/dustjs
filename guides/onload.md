---
title: Loading Templates On-Demand
layout: guides
permalink: /guides/onload/
---
When you try to render a template or include a partial, Dust looks in its cache for the template's name. If the template isn't there, rendering will fail and Dust will throw an error.

You can tell Dust how to **load templates** that aren't in the cache by creating a function called `dust.onLoad`. When a template is requested and not found in the cache, Dust will call this function and try to load it.

```js
dust.onLoad = function(templateName, [options], callback) {
  // `templateName` is the name of the template requested by dust.render / dust.stream
  // or via a partial include, like {> "hello-world" /}
  // `options` can be set as part of a Context. They will be explored later
  // `callback` is a Node-like callback that takes (err, data)
}
```

## Callback

The callback can be used in several different ways depending on how you want to load and register your template.

### Uncompiled Template Source

You can load an uncompiled template and pass it to the callback. Dust will compile the template and register it under `templateName`.

```js
fs.readFile(templateName + '.dust', { encoding: 'utf8' }, function(err, data) {
  callback(null, data);
});
```

### Precompiled Template

If the template is precompiled, you can load it yourself so that time isn't spent compiling. When you call the callback, Dust will look in the cache a second time for the template that you registered.

```js
// pre-2.7: load a compiled Javascript file
fs.readFile(templateName + '.js', { encoding: 'utf8' }, function(err, data) {
  dust.loadSource(data);
  callback();
});
```

```js
// 2.7: you can compile templates as CommonJS modules
require('./views/' + templateName)(dust);
callback();
```

### Loading a Different Template (Dust 2.7.1)

In some cases, you may not actually want to load the template with the specified name, but instead use that name to find a different template to load. For example, if you had templates `hello_en` and `hello_fr`, you could respect a user's language settings.

If you pass a compiled template function to the callback, that template will be rendered instead of the originally-requested template. The new template will **not** be registered under the original name.

`options` can be set as part of the context passed to Dust to render. For information on options, see [Context Options](/guides/contexts/#context-options-dust-271).

```js
dust.onLoad = function(templateName, options, callback) {
  // templateName is 'hello'
  var name = templateName + '_' + options.lang;
  // name is 'hello_fr'
  // Look in the cache for the template, and load it if isn't there
  var tmpl = dust.cache[name] || require('./' + name)(dust);
  // The template is cached under 'hello_fr' for next time
  callback(null, tmpl);
};
```
