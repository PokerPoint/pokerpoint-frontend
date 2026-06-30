export interface Participant {
	userId: string;
	displayName: string;
}

export interface RoomState {
	roomName: string;
	card: string;
	cards: string[];
	ownerUUID: string;
	participants: Participant[];
	votes: string[];
}

export interface RevealedVote {
	userId: string;
	vote: string;
}

export interface JiraTicket {
	key: string;
	summary: string;
}

export type IncomingMessage =
	| { event: "state"; data: RoomState }
	| { event: "user-join"; data: Participant }
	| { event: "user-disconnect"; data: { userId: string } }
	| { event: "vote"; data: { userId: string } }
	| { event: "jira"; data: { items: JiraTicket[] } }
	| { event: "show"; data: RevealedVote[] }
	| { event: "card"; data: { name: string } };

export type OutgoingMessage =
	| { action: "join"; roomId: string; displayName: string; userId: string }
	| { action: "heartbeat" }
	| { action: "vote"; roomId: string; vote: string; userId: string }
	| { action: "show"; roomId: string }
	| { action: "card"; roomId: string; name: string }
	| { action: "jira"; roomId: string; userId: string; jql: string };

export const NO_CARD = "N/A";
