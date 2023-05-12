type MessageType = {
    t: string;
    p: object | string;
};

const CLOSE = 0;
const OPEN = 1;

interface Subscriber {
    uuid: string;
    type: string;
    callback: CallableFunction;
}

interface WebSocketClient {
    host: string;
    subscribers: Subscriber[];
    status: number;
    ws: WebSocket;
    isReconnecting: boolean;
    isDebug: boolean;
}

class WebSocketClient {
    constructor(host: string, isReconnecting = true, isDebug = false) {
        this.subscribers = [];
        this.status = CLOSE;
        this.host = host;
        this.isReconnecting = isReconnecting;
        this.isDebug = isDebug
    }

    onWSOpen() {}

    async connect() {
        const onOpen = () => {
            this.status = OPEN;
            this.onWSOpen();
            if (this.isDebug) console.log("WebSocketEvent Open");
        };

        const onMessage = (e: MessageEvent<string>) => {
            this.processMessage(e.data);
        };

        const onError = (e: Event) => {
            if (this.isDebug) console.error(`WebSocketEvent Error ${e}`);
        };

        const onClose = () => {
            this.status = CLOSE;
            if (this.isDebug) console.log("WebSocketEvent Close");
            if (this.isReconnecting)
                setTimeout(() => {
                    this.connect().then((ws: WebSocket) => {
                        ws.onopen = onOpen;
                        ws.onmessage = onMessage;
                        ws.onclose = onClose;
                        ws.onerror = onError;
                        this.ws = ws;
                    });
                }, 5000);
        };

        const ws = new WebSocket(this.host);
        ws.onopen = onOpen;
        ws.onmessage = onMessage;
        ws.onclose = onClose;
        ws.onerror = onError;
        this.ws = ws;
        return ws;
    }

    close() {
        this.isReconnecting = false;
        if (this.ws) this.ws.close();
    }

    processMessage(data: string) {
        const dt = JSON.parse(data);
        this.subscribers.map((e: Subscriber) => {
            if (dt.t === e.type) {
                e.callback(dt.p);
            }
            return e;
        });
    }

    send(data: MessageType) {
        this.ws.send(JSON.stringify(data));
    }

    subscribe(type: string, callback: CallableFunction, uuid: string) {
        this.subscribers.push({
            uuid: uuid,
            type: type,
            callback: callback,
        });
        return uuid;
    }

    unsubscribe(uuid: string) {
        this.subscribers = this.subscribers.filter(
            (e: Subscriber) => e.uuid !== uuid
        );
    }
}

export default WebSocketClient;
