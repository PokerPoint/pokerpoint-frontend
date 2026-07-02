import type { Metadata } from "next";
import LegalPage from "../_components/landing/LegalPage";

export const metadata: Metadata = {
	title: "Privacy policy",
	description: "How PokerPoint collects, uses and manages your information.",
};

export default function PrivacyPage() {
	return (
		<LegalPage title="Privacy policy" effectiveDate="02/07/2026">
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
				We use the data solely to support planning poker sessions and optional Jira linking. With
				your consent, we also use Google Analytics to understand how the website is used (see
				&ldquo;Analytics and cookies&rdquo; below). We do not use your data for advertising.
			</p>

			<h2>3. Data retention and deletion</h2>
			<p>
				All data is temporary. We use DynamoDB with TTL (Time to Live) policies to automatically
				delete room session data, participant display names, and Jira tokens and related metadata.
				Data is purged after 8 hours of creation.
			</p>

			<h2>4. Local storage</h2>
			<p>
				We may use your browser's localStorage to remember your theme selection, optionally your
				display name, and your analytics cookie consent choice. This data is stored only in your
				browser and never sent to our servers.
			</p>

			<h2>5. Analytics and cookies</h2>
			<p>
				We use Google Analytics 4, a service provided by Google LLC, to understand how visitors use
				the website (for example, which pages are viewed, approximate location derived from your IP
				address, and device or browser type). This helps us improve PokerPoint.
			</p>
			<p>
				Analytics cookies are only set with your consent. We use Google Consent Mode, which keeps
				analytics storage disabled by default until you accept via our cookie banner. If you reject
				or ignore the banner, no analytics cookies are set. You can change your choice at any time
				by clearing your browser's site data, which will show the banner again.
			</p>
			<p>
				Google processes this data as described in Google's own privacy policy, available at{" "}
				<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
					https://policies.google.com/privacy
				</a>
				.
			</p>

			<h2>6. Data sharing</h2>
			<p>
				Other than the Google Analytics processing described above, we do not share, sell, or
				transfer your data to any third parties.
			</p>

			<h2>7. Children's privacy</h2>
			<p>
				PokerPoint is not intended for children under 13. We do not knowingly collect personal data
				from children.
			</p>

			<h2>8. Your rights</h2>
			<p>
				If you are located in the UK or EU, you may have rights under the GDPR/UK GDPR. Because all
				data is short-lived and automatically deleted, we may not retain any data to process your
				request.
			</p>

			<h2>9. Changes to this policy</h2>
			<p>
				We may update this policy periodically. If changes are made, the new policy will be posted
				here with the revised date above.
			</p>

			<h2>10. Contact us</h2>
			<p>
				Questions? Contact us at <a href="mailto:support@wannaverse.com">support@wannaverse.com</a>.
			</p>
		</LegalPage>
	);
}
