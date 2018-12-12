import ThreadConnection, { MessageListener, ProcedureHandler } from "./ThreadConnection.js";

export default class Thread<T> {
    private connections: Map<any, ThreadConnection<T>> = new Map();
    private threadType: T;
    private subscribers: Map<any, Array<MessageListener>> = new Map();
    private procedures: Map<any, ProcedureHandler> = new Map();

    constructor(threadType: T) {
        this.threadType = threadType;
    }

    public access(thread: T) {
        return this.connections.get(thread);
    }

    public link(threadType: T, port: MessagePort) {
        const connection = new ThreadConnection(port as MessagePort, this.threadType);
        this.subscribers.forEach((sub, topic) => {
            sub.forEach(listener => {
                connection.on(topic, listener);
            });
        });
        this.procedures.forEach((handler, procedure) => {
            connection.act(procedure, handler);
        });
        this.connections.set(threadType, connection);
        return connection;
    }

    open() {
        for (let connection of this.connections.values()) {
            connection.open();
        }
    }

    async waitForRemotes() {
        const waits: Array<Promise<any>> = [];
        for (let connection of this.connections.values()) {
            waits.push(connection.waitForRemote());
        }
        return Promise.all(waits);
    }

    on(topic: any, listener: MessageListener) {
        let subscribers = this.subscribers.get(topic);
        if (!subscribers) {
            subscribers = [];
        }
        subscribers.push(listener);
        this.subscribers.set(topic, subscribers);
        this.connections.forEach(connection => {
            connection.on(topic, listener);
        });
    }

    off(topic: any, listener: MessageListener) {
        let subscribers = this.subscribers.get(topic);
        if (!subscribers) {
            return;
        }
        const subscriberIndex = subscribers.indexOf(listener);
        if (subscriberIndex === -1) {
            return;
        }
        delete subscribers[subscriberIndex];
        this.connections.forEach(connection => {
            connection.off(topic, listener);
        });
    }

    act(topic: any, listener: ProcedureHandler) {
        this.procedures.set(topic, listener);
        this.connections.forEach(connection => {
            connection.act(topic, listener);
        });
    }

    emit(topic: any, data?: any, transferables?: Array<any>) {
        for (const connection of this.connections.values()) {
            connection.emit(topic, data, transferables);
        }
    }
}