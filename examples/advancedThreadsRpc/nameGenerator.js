import Thread from "./../../dist/Thread.js";

let lastName = "";
function makeName() {
    let rand = Math.round(Math.random() * 10);
    let name = "";
    switch (rand) {
        case 0: name = "Logan"; break;
        case 1: name = "Coby"; break;
        case 2: name = "Casey"; break;
        case 3: name = "Dylan"; break;
        case 4: name = "Kai"; break;
        case 5: name = "Ash"; break;
        case 6: name = "Alex"; break;
        case 7: name = "Drew"; break;
        case 8: name = "Lee"; break;
        case 9: name = "Hunter";
    }
    if (name === lastName) {
        name = makeName();
    }
    return name;
}

async function start() {
    const thread = new Thread("nameGenerator");
    // Delay connecting to simulate some work
    setTimeout(async () => {
        thread.act("linkPerson", async ctx => {
            thread.link("person", ctx.request.ports[0]);
            thread.access("person").open();
        });
        thread.act("makeName", ctx => {
            let name = makeName();
            ctx.response.data = name;
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