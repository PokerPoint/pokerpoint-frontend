const KEYS = {
	userUUID: "userUUID",
	displayName: "pokerPointDisplayName",
	jiraLinked: "jiraLinked",
};

function generateUUID(): string {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export const storage = {
	getUserUUID(): string {
		if (typeof window === "undefined") return "";
		let uuid = localStorage.getItem(KEYS.userUUID);
		if (!uuid) {
			uuid = generateUUID();
			localStorage.setItem(KEYS.userUUID, uuid);
		}
		return uuid;
	},

	getDisplayName(): string {
		if (typeof window === "undefined") return "";
		return localStorage.getItem(KEYS.displayName) ?? "";
	},

	setDisplayName(name: string): void {
		localStorage.setItem(KEYS.displayName, name);
	},

	getJiraLinked(): string | null {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(KEYS.jiraLinked);
	},

	setJiraLinked(value: string | null): void {
		if (value) {
			localStorage.setItem(KEYS.jiraLinked, value);
		} else {
			localStorage.removeItem(KEYS.jiraLinked);
		}
	},
};
