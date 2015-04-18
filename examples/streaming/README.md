To run:

    npm install && npm start

This example shows manual streaming with Dust and Express. Express doesn't natively support streaming using a view engine, so we pipe the output of `dust.stream` directly to `res`.

The example proxies dustjs.com through your local server and injects a CDN copy of jQuery. In your browser network waterfall, notice that jQuery starts loading before the page has finished loading, because Dust streams chunks to the browser as they complete.

`dust.onLoad` is manually defined to show Dust how to load templates. By default, Dust will throw an error if you try to render a template without loading it into the Dust cache first.

The Dust cache is disabled, so templates are compiled on every page load. Try changing the template in the `views` folder and see how it's immediately changed on refresh.
