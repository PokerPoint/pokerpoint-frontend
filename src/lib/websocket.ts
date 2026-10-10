import { config } from "./config";
import { storage } from "./storage";
import { IncomingMessage, OutgoingMessage } from "./types";

type MessageHandler = (message: IncomingMessage) => void;
type StatusHandler = () => void;

interface Handlers {
	onMessage: MessageHandler;
	onReconnecting?: StatusHandler;
	onClose?: StatusHandler;
	onError?: StatusHandler;
}

export class WebSocketService {
	private socket: WebSocket | null = null;
	private heartbeat: ReturnType<typeof setInterval> | null = null;
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private joinTimer: ReturnType<typeof setTimeout> | null = null;
	private reconnectAttempts = 0;
	private roomId: string | null = null;
	private displayName = "";
	private handlers: Required<Handlers> = {
		onMessage: () => {},
		onReconnecting: () => {},
		onClose: () => {},
		onError: () => {},
	};
	private closedByUser = false;

	connect(roomId: string, displayName: string, handlers: Handlers): void {
		this.roomId = roomId;
		this.displayName = displayName;
		this.handlers = {
			onMessage: handlers.onMessage,
			onReconnecting: handlers.onReconnecting ?? (() => {}),
			onClose: handlers.onClose ?? (() => {}),
			onError: handlers.onError ?? (() => {}),
		};
		this.closedByUser = false;
		this.reconnectAttempts = 0;
		this.addWindowListeners();
		this.open();
	}

	send(message: OutgoingMessage): void {
		if (this.socket?.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(message));
		}
	}

	disconnect(): void {
		this.closedByUser = true;
		this.stopHeartbeat();
		this.clearReconnectTimer();
		this.clearJoinTimer();
		this.removeWindowListeners();
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}
		this.roomId = null;
	}

	get currentRoomId(): string | null {
		return this.roomId;
	}

	private open(): void {
		const socket = new WebSocket(config.webSocketUrl);
		this.socket = socket;

		socket.onopen = () => {
			if (socket !== this.socket) return;
			this.send({
				action: "join",
				roomId: this.roomId ?? "",
				displayName: this.displayName,
				userId: storage.getUserUUID(),
			});
			this.startHeartbeat();
			// An open socket that never gets the room state back is as good as closed.
			this.joinTimer = setTimeout(() => socket.close(), config.reconnect.joinTimeoutMs);
		};

		socket.onmessage = (event) => {
			if (socket !== this.socket) return;
			const parsed = JSON.parse(event.data) as IncomingMessage;
			// Only a full state message proves the rejoin worked, so reset the backoff here.
			if (parsed.event === "state") {
				this.clearJoinTimer();
				this.reconnectAttempts = 0;
			}
			this.handlers.onMessage(parsed);
		};

		socket.onclose = () => {
			if (socket !== this.socket) return;
			this.stopHeartbeat();
			this.clearJoinTimer();
			this.socket = null;
			if (!this.closedByUser) {
				this.scheduleReconnect();
			}
		};

		socket.onerror = () => {
			if (socket !== this.socket) return;
			this.handlers.onError();
		};
	}

	// API Gateway drops every connection after 2 hours, and sleep or network changes drop it sooner.
	private scheduleReconnect(): void {
		if (this.reconnectTimer || this.socket) return;
		if (this.reconnectAttempts >= config.reconnect.maxAttempts) {
			this.removeWindowListeners();
			this.handlers.onClose();
			return;
		}

		this.handlers.onReconnecting();

		// Offline attempts would only burn retries; the online listener picks this up instead.
		if (!navigator.onLine) return;

		const delay = Math.min(
			config.reconnect.baseDelayMs * 2 ** this.reconnectAttempts,
			config.reconnect.maxDelayMs,
		);
		this.reconnectAttempts += 1;
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			this.open();
		}, delay);
	}

	private reconnectNow = (): void => {
		if (this.closedByUser || this.socket || !this.roomId) return;
		if (document.visibilityState !== "visible" || !navigator.onLine) return;
		this.clearReconnectTimer();
		this.reconnectAttempts = 0;
		this.handlers.onReconnecting();
		this.open();
	};

	private addWindowListeners(): void {
		window.addEventListener("online", this.reconnectNow);
		document.addEventListener("visibilitychange", this.reconnectNow);
	}

	private removeWindowListeners(): void {
		window.removeEventListener("online", this.reconnectNow);
		document.removeEventListener("visibilitychange", this.reconnectNow);
	}

	private clearReconnectTimer(): void {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
	}

	private clearJoinTimer(): void {
		if (this.joinTimer) {
			clearTimeout(this.joinTimer);
			this.joinTimer = null;
		}
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
