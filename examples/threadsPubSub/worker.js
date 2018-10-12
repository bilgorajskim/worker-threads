import Thread from "./../../dist/Thread.js";

async function start() {
    const thread = new Thread("worker");
    // Delay connecting to simulate some work
    setTimeout(async () => {
        // Connect worker thread with main thread
        console.log("Worker ready");
        thread.link("main", self);

        // Add global event handler
        thread.on("someEvent", data => {
            console.log("I received an event with data", data);
        });
        // Add event handler only for specific connection
        thread.access("main").on("someEvent", data => {
            console.log("I received an event with data from main", data);
        });

        // Open all thread connections
        thread.open();
        // Wait until all thread connections are ready for communication
        await thread.waitForRemotes();
    }, 1000);
}

start();