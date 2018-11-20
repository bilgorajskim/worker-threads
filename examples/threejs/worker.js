import Thread from "./../../dist/Thread.js";
import { makeCanvas, runBenchmark } from "./utils.js";

async function start() {
    const thread = new Thread("worker");
    // Delay connecting to simulate some work
    setTimeout(async () => {
        // Add global RPC
        thread.act("benchmark", async ctx => {
            var offscreenCanvas = ctx.request.data;
            let animate = makeCanvas(offscreenCanvas);
            console.log("Running benchmark on worker");
            console.time();
            await runBenchmark(animate);
            console.timeEnd();

            ctx.response.data = "bar";
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