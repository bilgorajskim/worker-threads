import Thread from "./../../dist/Thread.js";

async function start() {
    const thread = new Thread("person");
    // Delay connecting to simulate some work
    setTimeout(async () => {
        thread.act("linkNameGenerator", async ctx => {
            thread.link("nameGenerator", ctx.request.ports[0]);
            thread.access("nameGenerator").open();
            await thread.access("nameGenerator").waitForRemote();
        });
        thread.act("greet", async ctx => {
            const name = await thread.access("nameGenerator").call("makeName");
            const jobTitle = ctx.request.data;
            ctx.response.data = `Hello, my name is ${name} and I am ${jobTitle}`;
        });

        // Connect worker thread with main thread
        console.log("Worker ready");
        thread.link("main", self);

        // Open all thread connections
        thread.open();
        // Wait until all thread connections are ready for communication
        await thread.waitForRemotes();
    }, 1000);
}

start();