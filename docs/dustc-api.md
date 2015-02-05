---
layout: docs
title: Dust Syntax
permalink: /docs/dustc-api/
---

# dustc

To compile a template on the command line, use the dustc command.  Everything in square brackets is optional. The syntax is:

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