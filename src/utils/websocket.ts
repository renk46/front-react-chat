type MessageType = Array<string | object>

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
	isFastReconnect: boolean
	timeReconnectingMs: number
	isDebug: boolean
}

class WebSocketClient {
	constructor(host: string, isReconnecting = true, isDebug = false) {
		this.subscribers = []
		this.pendingMessages = []
		this.status = Status.CLOSE
		this.host = host
		this.isReconnecting = isReconnecting
		this.isFastReconnect = false
		this.timeReconnectingMs = 5000
		this.isDebug = isDebug
	}

	/* eslint-disable class-methods-use-this */
	onStatusChanged(status: number) {}

	/* eslint-disable class-methods-use-this */
	onAuthSuccess() {}

	/* eslint-disable class-methods-use-this */
	onAuthFailed() {}

	/* eslint-disable class-methods-use-this */
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

	connect() {
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
			if (this.isFastReconnect) {
				this.isFastReconnect = false
				this.connect()
			} else if (this.isReconnecting)
				setTimeout(() => {
					if (this.isDebug) console.log('WebSocket reConnect')
					this.connect()
				}, this.timeReconnectingMs)
		}

		const ws = new WebSocket(this.host)
		ws.onopen = onOpen
		ws.onmessage = onMessage
		ws.onclose = onClose
		ws.onerror = onError
		this.ws = ws
		return ws
	}

	close() {
		this.ws.close()
	}

	reconnect() {
		this.isFastReconnect = true
		this.close()
	}

	handleMessage(data: string) {
		const message: Array<string | object> = JSON.parse(data)
		if (message.length < 2) throw new Error("Broke type message")
		if (message[0] === String(MessageTypes.AUTH)) {
			if (message[1] === 'SUCCESS') this.onAuthSuccess()
			else if (message[1] === 'WHOAREYOU') this.onAuthFailed()
			else if (message[1] === 'TOKENEXPIRED') this.onTokenExpired()
		} else if (message[0] === String(MessageTypes.DATA)) this.handleMessageData(message[1])
	}

	handleMessageData(payload: any) {
		if (payload.result === 'success') {
			this.subscribers.map((e: Subscriber) =>
				payload.response === e.response ? e.callback(payload.data) : null
			)
		} else if (payload.result === 'failed') {
			console.error('HandleMessageError', payload.data)
		}
	}

	subscribe(response: string, callback: CallableFunction, uuid: string = '') {
		const sub = {
			uuid,
			response,
			callback,
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
		return this.send([String(MessageTypes.AUTH), payload])
	}

	sendData(payload: object | string) {
		return this.send([String(MessageTypes.DATA), payload])
	}

	whoiam() {
		return this.sendData({
			request: 'WHOIAM',
			data: {},
		})
	}
}

export default WebSocketClient