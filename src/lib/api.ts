import { config } from "./config";

export async function createRoom(
	roomName: string,
	cards: string[],
	userUUID: string,
): Promise<{ roomId: string }> {
	const response = await fetch(`${config.apiBaseUrl}/create-room`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ roomName, cards, userUUID }),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || "Failed to create room");
	}

	return response.json();
}

export async function roomExists(roomId: string): Promise<boolean> {
	try {
		const response = await fetch(`${config.apiBaseUrl}/check?roomId=${encodeURIComponent(roomId)}`);
		if (!response.ok) return false;
		const body = await response.json();
		return Boolean(body.valid);
	} catch {
		return false;
	}
}
