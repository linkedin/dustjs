---
layout: docs
title: dustc
permalink: /docs/dustc-api/
---

# dustc post-2.6

For Dust 2.6, the compiler has been rewritten to act more like a Linux binary. You can pipe in and out of the compiler, and compile whole directory trees at once.

```
$ dustc [options] [path1 [path2 path3...]]
```

For example, to compile all templates in the directory `tmpl` to `output.js`:

```
$ dustc tmpl/**/*.dust -o output.js
```

To compile a few templates to AMD modules in-place:

```
$ dustc -as tmpl/one.dust tmpl/two.dust
```

For all allowed options, run `dustc --help`

# dustc pre-2.6

```
$ dustc [{-n|--name}={template_name}] {inputfilename} [{outputfilename}]
```

For example, to compile a template on the command line and have it registered under the same name as the source file:

```
$ dustc input.tl template.html
```

You can customize the name under which the template is registered by using the "name" option:

```
$ dustc --name=mytemplate input.tl template.html
```
