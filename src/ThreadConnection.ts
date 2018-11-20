export type MessageListener = (data: any, ports?: ReadonlyArray<MessagePort>) => any;
export type ProcedureHandler = (ctx: ProcedureHandlerContext) => any;

type ProcedureHandlerContext = {
    request: {
        threadId: any,
        topic: any,
        data: any,
        messageId: number,
        ports: ReadonlyArray<MessagePort>
    },
    response: {
        data: any,
        transfer: Array<any>
    }
};

export default class ThreadConnection<T> {
    public readonly port: MessagePort | WindowOrWorkerGlobalScope;
    private subscribers: Map<any, Array<MessageListener>> = new Map();
    private procedures: Map<any, ProcedureHandler> = new Map();
    private resolveStart?: () => any;
    private callPromises: Map<number, MessageListener> = new Map();
    private messageCounter = Number.MIN_SAFE_INTEGER;
    public readonly threadType: T;
    private _remoteThreadType: T;
    private ready = false;
    private remoteReady = false;

    constructor(port: MessagePort, threadType: T) {
        this.threadType = threadType;
        this.port = port;
        this.on("ready", async () => {
            if (this.remoteReady) {
                return;
            }
            this.remoteReady = true;
            if (this.ready) {
                this.emit("ready");
            }
            await this.discover();
            if (this.resolveStart) {
                this.resolveStart();
            }
        });
        this.act("discover", (ctx) => {
            ctx.response.data = this.threadType;
        });
        this.port.onmessage = async event => {
            const topic = event.data[0];
            const data = event.data[1];
            const messageId = event.data[2];
            const isRpcRequest = event.data[3];
            const isRpcResponse = event.data[4];
            const ports = event.ports;
            if (isRpcRequest) {
                // Handle RPC request
                const procedure = this.procedures.get(topic);
                if (procedure) {
                    const ctx: ProcedureHandlerContext = {
                        request: {
                            threadId: this._remoteThreadType,
                            topic,
                            data,
                            messageId,
                            ports
                        },
                        response: {
                            data: null,
                            transfer: []
                        }
                    };
                    await procedure(ctx);
                    if (this.port instanceof MessagePort) {
                        this.port.postMessage([topic, ctx.response.data, messageId, false, false], ctx.response.transfer);
                    } else {
                        (this.port as Window).postMessage([topic, ctx.response.data, messageId, false, true], "*", ctx.response.transfer);
                    }
                    this.updateMessageCounter();
                    return;
                }
                throw new Error("Missing RPC handler: " + topic);
            } else if (isRpcResponse) {
                const callPromise = this.callPromises.get(messageId);
                // Handle RPC response
                await callPromise(data);
                this.callPromises.delete(messageId);
            }

            const subscribers = this.subscribers.get(topic);
            if (subscribers) {
                for (let subscriber of subscribers) {
                    subscriber(data, event.ports);
                }
            }
        };
    }

    public get isReady () {
        return this.ready;
    }

    public get isRemoteReady () {
        return this.remoteReady;
    }

    public get remoteThreadType () {
        return this._remoteThreadType;
    }

    private async discover() {
        if (this._remoteThreadType) {
            return this._remoteThreadType;
        }
        const remoteThreadType = await this.call("discover") as T;
        this._remoteThreadType = remoteThreadType;
        return this._remoteThreadType;
    }

    open () {
        this.ready = true;
        this.emit("ready");
    }

    waitForRemote () {
        return new Promise(resolve => {
            this.resolveStart = resolve;
            if (this.remoteReady) {
                this.resolveStart();
            } else {
                this.open();
            }
        });
    }

    on(topic: any, listener: MessageListener) {
        let subscribers = this.subscribers.get(topic);
        if (!subscribers) {
            subscribers = [];
        }
        subscribers.push(listener);
        this.subscribers.set(topic, subscribers);
    }
    
    /**
     * Send a message
     * @param topic Message topic
     * @param data Message data
     * @param transferables Objects to be transferred 
     */
    emit(topic: any, data?: any, transferables?: Array<any>) {
        if (this.port instanceof MessagePort) {
            this.port.postMessage([topic, data, this.messageCounter, false, false], transferables);
        } else {
            (this.port as Window).postMessage([topic, data, this.messageCounter, false, false], "*", transferables);
        }
        this.updateMessageCounter();
    }

    private updateMessageCounter() {
        if (this.messageCounter >= Number.MAX_SAFE_INTEGER) {
            this.messageCounter = Number.MIN_SAFE_INTEGER;
        } else {
            this.messageCounter++;
        }
    }
    
    /**
     * Send a message and wait for response
     * @param topic Message topic
     * @param data Message data
     * @param transferables Objects to be transferred 
     */
    call(topic: any, data?: any, transferables?: Array<any>) {
        return new Promise(resolve => {
            this.callPromises.set(this.messageCounter, resolve);
            if (this.port instanceof MessagePort) {
                this.port.postMessage([topic, data, this.messageCounter, true, false], transferables);
            } else {
                (this.port as Window).postMessage([topic, data, this.messageCounter, true, false], "*", transferables);
            }
            this.updateMessageCounter();
        });
    }

    act(topic: any, listener: ProcedureHandler) {
        this.procedures.set(topic, listener);
    }
}