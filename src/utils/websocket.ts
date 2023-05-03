type MessageType = {
    type: string;
    message: object | string;
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
}

class WebSocketClient {
    constructor(host: string, isReconnecting = true) {
        this.subscribers = [];
        this.status = CLOSE;
        this.host = host;
        this.isReconnecting = isReconnecting;
    }

    onWSOpen() {}

    async connect() {
        const onOpen = () => {
            this.status = OPEN;
            this.onWSOpen();
            console.log("WS open");
        };

        const onMessage = (e: MessageEvent<string>) => {
            this.processMessage(e.data);
        };

        const onError = (e: Event) => {
            console.error("WS error: " + e);
        };

        const onClose = () => {
            console.log("WS close");
            this.status = CLOSE;
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
            if (dt.type === e.type) {
                e.callback(dt);
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
