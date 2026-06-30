import type { Metadata } from "next";
import LegalPage from "../_components/landing/LegalPage";

export const metadata: Metadata = {
	title: "Privacy policy",
	description: "How PokerPoint collects, uses and manages your information.",
};

export default function PrivacyPage() {
	return (
		<LegalPage title="Privacy policy" effectiveDate="05/06/2025">
			<p>
				PokerPoint ("we", "our", or "us") values your privacy. This Privacy Policy explains how we
				collect, use, and manage information when you use our website (https://www.pokerpoint.co.uk).
			</p>

			<h2>1. Information we collect</h2>
			<p>We collect only the information needed to support your session experience:</p>
			<ul>
				<li>Room name</li>
				<li>Estimation card settings</li>
				<li>Participant display names (which users may choose to make personally identifiable)</li>
				<li>Votes and session metadata</li>
				<li>Jira access tokens and linked issue information (if Jira integration is used)</li>
			</ul>

			<h2>2. Data usage</h2>
			<p>
				We use the data solely to support planning poker sessions and optional Jira linking. We do
				not use your data for advertising or analytics.
			</p>

			<h2>3. Data retention and deletion</h2>
			<p>
				All data is temporary. We use DynamoDB with TTL (Time to Live) policies to automatically
				delete room session data, participant display names, and Jira tokens and related metadata.
				Data is purged after 8 hours of creation.
			</p>

			<h2>4. Local storage</h2>
			<p>
				We may use your browser's localStorage to remember your theme selection and optionally your
				display name. This data is stored only in your browser and never sent to our servers.
			</p>

			<h2>5. Data sharing</h2>
			<p>
				We do not share, sell, or transfer your data to any third parties. No third-party trackers
				or analytics tools are used.
			</p>

			<h2>6. Children's privacy</h2>
			<p>
				PokerPoint is not intended for children under 13. We do not knowingly collect personal data
				from children.
			</p>

			<h2>7. Your rights</h2>
			<p>
				If you are located in the UK or EU, you may have rights under the GDPR/UK GDPR. Because all
				data is short-lived and automatically deleted, we may not retain any data to process your
				request.
			</p>

			<h2>8. Changes to this policy</h2>
			<p>
				We may update this policy periodically. If changes are made, the new policy will be posted
				here with the revised date above.
			</p>

			<h2>9. Contact us</h2>
			<p>
				Questions? Contact us at <a href="mailto:support@wannaverse.com">support@wannaverse.com</a>.
			</p>
		</LegalPage>
	);
}
