import Thread from "./../../dist/Thread.js";

async function start() {
    const thread = new Thread("worker");
    // Delay connecting to simulate some work
    setTimeout(async () => {
        // Add global RPC
        thread.act("foo", ctx => {
            ctx.response.data = "bar";
        });
        // Connect worker thread with main thread
        console.log("Worker ready");
        thread.link("main", self);

        // Add RPC only for specific connection
        thread.access("main").act("specialFooJustForMain", ctx => {
            ctx.response.data = "main bar";
        });

        // Open all thread connections
        thread.open();
        // Wait until all thread connections are ready for communication
        await thread.waitForRemotes();
    }, 1000);
}

start();