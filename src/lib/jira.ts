import { config } from "./config";
import { storage } from "./storage";

export function buildJiraAuthUrl(roomId: string): string {
	const state = encodeURIComponent(`${storage.getUserUUID()}:${roomId}`);
	const params = new URLSearchParams({
		audience: "api.atlassian.com",
		client_id: config.jira.clientId,
		scope: config.jira.scope,
		redirect_uri: config.jira.redirectUri,
		state,
		response_type: "code",
		prompt: "consent",
	});
	return `https://auth.atlassian.com/authorize?${params.toString()}`;
}
