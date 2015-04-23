To run:

    npm install && npm run compile && npm start

This example shows how you might use Dust templates as CommonJS modules.

The `compile` script compiles the templates in `views/` as CommonJS modules. In the application, a small helper function takes care of requiring the template.

The required template can be used as a function to render itself.
