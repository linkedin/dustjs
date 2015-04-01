To install:

    npm install && bower install

To (re)compile templates:

    ../../bin/dustc views/*.dust --output=lib/compiled.js

Then load `index.html` in your browser.

This example shows how to simply load Dust using script tags. Templates are stored in the **views** directory and are then compiled to a single script file that is included on the page.
