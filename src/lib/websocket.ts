import { config } from "./config";
import { storage } from "./storage";
import { IncomingMessage, OutgoingMessage } from "./types";

type MessageHandler = (message: IncomingMessage) => void;
type StatusHandler = () => void;

export class WebSocketService {
	private socket: WebSocket | null = null;
	private heartbeat: ReturnType<typeof setInterval> | null = null;
	private roomId: string | null = null;
	private displayName = "";
	private onMessage: MessageHandler = () => {};
	private onClose: StatusHandler = () => {};
	private onError: StatusHandler = () => {};
	private closedByUser = false;

	connect(
		roomId: string,
		displayName: string,
		handlers: { onMessage: MessageHandler; onClose?: StatusHandler; onError?: StatusHandler },
	): void {
		this.roomId = roomId;
		this.displayName = displayName;
		this.onMessage = handlers.onMessage;
		this.onClose = handlers.onClose ?? (() => {});
		this.onError = handlers.onError ?? (() => {});
		this.closedByUser = false;

		this.socket = new WebSocket(config.webSocketUrl);

		this.socket.onopen = () => {
			this.send({
				action: "join",
				roomId,
				displayName,
				userId: storage.getUserUUID(),
			});
			this.startHeartbeat();
		};

		this.socket.onmessage = (event) => {
			const parsed = JSON.parse(event.data) as IncomingMessage;
			this.onMessage(parsed);
		};

		this.socket.onclose = () => {
			this.stopHeartbeat();
			if (!this.closedByUser) {
				this.onClose();
			}
		};

		this.socket.onerror = () => this.onError();
	}

	send(message: OutgoingMessage): void {
		if (this.socket?.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(message));
		}
	}

	disconnect(): void {
		this.closedByUser = true;
		this.stopHeartbeat();
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}
		this.roomId = null;
	}

	get currentRoomId(): string | null {
		return this.roomId;
	}

	private startHeartbeat(): void {
		this.stopHeartbeat();
		this.heartbeat = setInterval(() => {
			this.send({ action: "heartbeat" });
		}, config.heartbeatIntervalMs);
	}

	private stopHeartbeat(): void {
		if (this.heartbeat) {
			clearInterval(this.heartbeat);
			this.heartbeat = null;
		}
	}
}
