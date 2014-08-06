---
layout: docs
title: Dust Syntax
permalink: /docs/dustc-api/
---

To compile a template on the command line, use the dustc command. The syntax is:

	dustc [{-n|--name}=<template_name>] {inputfilename|-} [<outputfilename>] 
        
For example, to compile a template on the command line and have it registered under the same name as the source file:

	$ dustc template.html 
        
You can customize the name under which the template is registered by using tge "name" option:

	$ dustc --name=mytemplate template.html 
