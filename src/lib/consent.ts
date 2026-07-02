export const GA_MEASUREMENT_ID = "G-5G700GDTQX";
export const CONSENT_STORAGE_KEY = "pp-analytics-consent";

export type ConsentChoice = "granted" | "denied";

declare global {
	interface Window {
		dataLayer: unknown[];
		gtag: (...args: unknown[]) => void;
	}
}

export function readConsent(): ConsentChoice | null {
	if (typeof window === "undefined") {
		return null;
	}
	try {
		const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
		return value === "granted" || value === "denied" ? value : null;
	} catch {
		return null;
	}
}

export function writeConsent(choice: ConsentChoice): void {
	if (typeof window === "undefined") {
		return;
	}
	try {
		window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
	} catch {
		// Ignore storage failures (private mode, blocked cookies, etc.)
	}
}

export function updateGtagConsent(choice: ConsentChoice): void {
	if (typeof window === "undefined" || typeof window.gtag !== "function") {
		return;
	}
	window.gtag("consent", "update", { analytics_storage: choice });
}
