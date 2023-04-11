import { JsonObjectExpression } from "typescript"

const CLOSE = 0
const OPEN = 1

interface Subscriber {
	uuid: string,
	type: string,
	callback: CallableFunction
}

interface WebSocketClient {
	host: string
	subscribers: Subscriber[]
	status: number
	ws: WebSocket
}

class WebSocketClient {
	constructor(host: string) {
		this.subscribers = []
		this.status = CLOSE
		this.host = host
	}

	async connect() {
		const OnOpen = () => {
			this.status = OPEN
			console.log('WS open')
		}

		const OnMessage = (e: MessageEvent<string>) => {
			this.processMessage(e.data)
		}

		const OnError = (e: Event) => {
			console.error('WS error: ' + e)
		}

		const OnClose = () => {
			console.log('WS close')
			this.status = CLOSE
			setTimeout(() => {
				this.connect().then((ws: WebSocket) => {
					ws.onclose = OnClose
					ws.onopen = OnOpen
					ws.onmessage = OnMessage
					ws.onerror = OnError
					this.ws = ws
				})
			}, 5000)
		}

		const ws = new WebSocket(this.host)
		ws.onclose = OnClose
		ws.onopen = OnOpen
		ws.onmessage = OnMessage
		ws.onerror = OnError
		this.ws = ws
		return ws
	}

	close() {
		if (this.ws) this.ws.close()
	}

	processMessage(data: string) {
		const dt = JSON.parse(data)
		this.subscribers.map((e: Subscriber) => {
			if (dt.type === e.type) {
				e.callback(dt)
			}
			return e
		})
	}

	send(data: JsonObjectExpression) {
		this.ws.send(JSON.stringify(data))
	}

	subscribe(type: string, callback: CallableFunction, uuid: string) {
		this.subscribers.push({
			uuid: uuid,
			type: type,
			callback: callback
		})
		return uuid
	}

	unsubscribe(uuid: string) {
		this.subscribers = this.subscribers.filter((e: Subscriber) => e.uuid !== uuid)
	}
}

export default WebSocketClient
