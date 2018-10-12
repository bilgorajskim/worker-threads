import ThreadConnection from "./../../dist/ThreadConnection.js";

async function start() {
    const threadConnection = new ThreadConnection(self, "worker");
    setTimeout(async () => {
        threadConnection.act("foo", (ctx) => {
            ctx.response.data = "bar";
        });
        threadConnection.open();
        await threadConnection.waitForRemote();
        console.log("Worker ready");
    }, 1000);
}

start();