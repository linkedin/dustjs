To run:

    npm install && npm start

This example explicitly shows how Dust streams and flushes chunks to the browser.

If you use Dust's rendering interface, the callback is invoked once the entire template is done rendering. Therefore, your template will render as slowly as your slowest asynchronous call. Notice how the `/rendering` endpoint does not load for 10 seconds, even though you can see in the console that Dust is working on rendering the async blocks.

If you use Dust's streaming interface, Dust flushes pieces of your template to the browser as soon as they are done. However, Dust can't stream out-of-order, because browsers don't know how to interpret responses that are not in-order. This means that even if a chunk is done early, it has to wait for all previous chunks to complete.
