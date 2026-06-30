export const config = {
	apiBaseUrl: "https://api.production.pokerpoint.co.uk",
	webSocketUrl: "wss://wss.production.pokerpoint.co.uk",
	jira: {
		clientId: "HDIuLGOg69GDy95TMXopOPGXJAdN0sdf",
		redirectUri: "https://api.production.pokerpoint.co.uk/jira/callback",
		scope: "read:jira-work",
	},
	heartbeatIntervalMs: 60000,
	copyResetDelayMs: 2000,
};

export const cardPresets = {
	fibonacci: ["0", "1", "2", "3", "5", "8", "13"],
	tShirt: ["XS", "S", "M", "L", "XL", "XXL"],
};

export const chartColors = [
	"#FF8D29",
	"#FFB155",
	"#CE5900",
	"#E8740C",
	"#FFA742",
	"#A8480A",
	"#FFC97A",
	"#7A3508",
];

export const site = {
	name: "PokerPoint",
	title: "PokerPoint | Planning poker for agile teams",
	description:
		"Free, real-time planning poker for agile teams. Create a room, invite your team and estimate together in seconds. No sign-up required.",
	url: "https://www.pokerpoint.co.uk",
};

export function roomUrl(roomId: string): string {
	if (typeof window === "undefined") {
		return `${site.url}/app/?roomId=${encodeURIComponent(roomId)}`;
	}
	return `${window.location.origin}/app/?roomId=${encodeURIComponent(roomId)}`;
}
