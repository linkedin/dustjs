To run:

    npm install && bower install

To compile templates:

    npm run compile

Then load `index.html` in your browser.

This example shows how to load Dust as an AMD module using require.js. Templates are stored in the **views** directory and are referenced by their full path, so you can nest templates in subdirectories without any issue.

At the top of `main.js`, Dust AMD loading is enabled by setting `define.amd.dust = true`.

The `-as` flags passed to dustc cause templates to be compiled into individual files (`s`), and compiled as AMD modules (`a`).
