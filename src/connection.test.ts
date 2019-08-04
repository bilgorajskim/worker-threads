import ThreadConnection from "./ThreadConnection";

declare const MessageChannel: any;

enum ThreadConfig {
  A,
  B
}

describe("Connection", () => {
  it("should have correctly assigned type", () => {
    const channel = new MessageChannel();
    const conn = new ThreadConnection<ThreadConfig>(
      channel.port1,
      ThreadConfig.A
    );
    expect(conn.threadType).toEqual(ThreadConfig.A);
  });
  it("should open connection", () => {
    const channel = new MessageChannel();
    const aToB = new ThreadConnection<ThreadConfig>(
      channel.port1,
      ThreadConfig.A
    );
    const bToA = new ThreadConnection<ThreadConfig>(
      channel.port2,
      ThreadConfig.B
    );
    expect(aToB).not.toEqual(bToA);
    aToB.open();
    bToA.open();
    expect(aToB.isReady).toEqual(true);
    expect(bToA.isReady).toEqual(true);
  });
  it("should wait for remote", async done => {
    const channel = new MessageChannel();
    const aToB = new ThreadConnection<ThreadConfig>(
      channel.port1,
      ThreadConfig.A
    );
    const bToA = new ThreadConnection<ThreadConfig>(
      channel.port2,
      ThreadConfig.B
    );
    aToB.open();
    bToA.open();
    await aToB.waitForRemote();
    await bToA.waitForRemote();
    expect(aToB.isRemoteReady).toEqual(true);
    expect(bToA.isRemoteReady).toEqual(true);
    done();
  });
});
describe("Communication", function() {
  let channel;
  let aToB: ThreadConnection<ThreadConfig>;
  let bToA: ThreadConnection<ThreadConfig>;
  beforeEach(async done => {
    channel = new MessageChannel();
    aToB = new ThreadConnection<ThreadConfig>(channel.port1, ThreadConfig.A);
    bToA = new ThreadConnection<ThreadConfig>(channel.port2, ThreadConfig.B);

    aToB.open();
    bToA.open();
    await aToB.waitForRemote();
    await bToA.waitForRemote();
    done();
  });
  it("should emit and receive messages", async done => {
    bToA.on("foo", data => {
      expect(data).toEqual("some data");
      done();
    });
    aToB.emit("foo", "some data");
  });
  it("should call remote procedure", async done => {
    bToA.act("foo", ctx => (ctx.response.data = "bar"));
    const respFromB = await aToB.call("foo");
    expect(respFromB).toEqual("bar");

    aToB.act("foo", ctx => (ctx.response.data = "baz"));
    const respFromA = await bToA.call("foo");
    expect(respFromA).toEqual("baz");

    done();
  });
});
