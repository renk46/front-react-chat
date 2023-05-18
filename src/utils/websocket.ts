type MessageType = {
	type: string
	payload: object | string
}

export enum Status {
	CLOSE,
	OPEN,
}

export enum MessageTypes {
	AUTH,
	DATA,
}

interface Subscriber {
	uuid: string
	response: string
	callback: CallableFunction
}

interface WebSocketClient {
	host: string
	subscribers: Subscriber[]
	pendingMessages: string[]
	status: number
	ws: WebSocket
	isReconnecting: boolean
	isDebug: boolean
}

class WebSocketClient {
	constructor(host: string, isReconnecting = true, isDebug = false) {
		this.subscribers = []
		this.pendingMessages = []
		this.status = Status.CLOSE
		this.host = host
		this.isReconnecting = isReconnecting
		this.isDebug = isDebug
	}

	onStatusChanged(status: number) {}

	onAuthSuccess() {}

    onAuthFailed() {}

    onTokenExpired() {}

	isOpen() {
		return this.status === Status.OPEN
	}

	isClose() {
		return this.status === Status.CLOSE
	}

	changeStatus(status: number) {
		this.status = status
		this.onStatusChanged(status)
	}

	async connect() {
		const onOpen = () => {
			this.changeStatus(Status.OPEN)
			if (this.isDebug) console.log('WebSocketEvent Open')
		}

		const onMessage = (e: MessageEvent<string>) => {
			this.handleMessage(e.data)
		}

		const onError = (e: Event) => {
			if (this.isDebug) console.error(`WebSocketEvent Error ${e}`)
		}

		const onClose = () => {
			this.changeStatus(Status.CLOSE)
			if (this.isDebug) console.log('WebSocketEvent Close')
			if (this.isReconnecting)
				setTimeout(() => {
					if (this.isDebug) console.log('WebSocket reConnect')
					this.connect()
				}, 5000)
		}

		const ws = new WebSocket(this.host)
		ws.onopen = onOpen
		ws.onmessage = onMessage
		ws.onclose = onClose
		ws.onerror = onError
		this.ws = ws
		return ws
	}

	forceClose() {
		this.isReconnecting = false
		if (this.ws && !this.isClose()) this.ws.close()
	}

	handleMessage(data: string) {
		const message = JSON.parse(data)
		if (message.type === String(MessageTypes.AUTH)) {
            if (message.payload === 'SUCCESS') this.onAuthSuccess()
            else if (message.payload === 'WHOAREYOU') this.onAuthFailed()
            else if (message.payload === 'TOKENEXPIRED') this.onTokenExpired()
        }
		else if (message.type === String(MessageTypes.DATA)) this.handleMessageData(message.payload)
	}

	handleMessageData(payload: any) {
		this.subscribers.map((e: Subscriber) =>
			payload.response === e.response ? e.callback(payload.data) : null
		)
	}

	subscribe(response: string, callback: CallableFunction, uuid: string = "") {
		const sub = {
			uuid: uuid,
			response: response,
			callback: callback,
		}
		this.subscribers.push(sub)
		return () => {
			this.subscribers = this.subscribers.filter((e: Subscriber) => e !== sub)
		}
	}

	unsubscribe(uuid: string) {
		this.subscribers = this.subscribers.filter((e: Subscriber) => e.uuid !== uuid)
	}

	send(data: MessageType) {
		const message = JSON.stringify(data)
		if (this.ws && this.ws.readyState === this.ws.OPEN) this.ws.send(message)
		else this.pendingMessages.push(message)
	}

    sendAuth(payload: object | string) {
        return this.send({ type: String(MessageTypes.AUTH), payload: payload })
    }

	sendData(payload: object | string) {
		return this.send({ type: String(MessageTypes.DATA), payload: payload })
	}

	whoiam() {
		return this.sendData({
			request: 'WHOAIM',
		})
	}
}

export default WebSocketClient
