import type { Metadata } from "next";
import LegalPage from "../_components/landing/LegalPage";

export const metadata: Metadata = {
	title: "Terms of service",
	description: "The terms that govern your use of PokerPoint.",
};

export default function TermsPage() {
	return (
		<LegalPage title="Terms of service" effectiveDate="05/06/2025">
			<p>
				Welcome to PokerPoint! By accessing or using our website (https://www.pokerpoint.co.uk), you
				agree to be bound by these Terms of Service ("Terms"). Please read them carefully.
			</p>

			<h2>1. Acceptance of terms</h2>
			<p>
				By using PokerPoint, you agree to comply with and be legally bound by these Terms. If you do
				not agree, do not use the site.
			</p>

			<h2>2. Description of service</h2>
			<p>
				PokerPoint provides a free, open-source platform for agile teams to conduct planning poker
				sessions. Users can create rooms, invite participants, and estimate tasks collaboratively. No
				user registration is required.
			</p>

			<h2>3. User conduct</h2>
			<p>You agree to use PokerPoint lawfully and respectfully. Prohibited behavior includes:</p>
			<ul>
				<li>Uploading or transmitting malicious software or harmful content.</li>
				<li>Attempting unauthorized access to site infrastructure.</li>
				<li>Using the platform for harassment or illegal activity.</li>
			</ul>

			<h2>4. Intellectual property</h2>
			<p>
				All content on PokerPoint is the property of PokerPoint or its content suppliers.
				Open-source code is under the MIT License (see our GitHub).
			</p>

			<h2>5. Disclaimer of warranties</h2>
			<p>
				PokerPoint is provided "as is" without warranties. We do not guarantee error-free or
				uninterrupted service.
			</p>

			<h2>6. Limitation of liability</h2>
			<p>
				To the fullest extent permitted by law, PokerPoint shall not be liable for any indirect,
				incidental, or consequential damages from use or inability to use the website.
			</p>

			<h2>7. Changes to the terms</h2>
			<p>
				We may modify these Terms at any time. Changes will be posted on this page with the updated
				effective date. Continued use constitutes acceptance.
			</p>

			<h2>8. Governing law</h2>
			<p>
				These Terms are governed by the laws of England and Wales. Disputes shall be subject to the
				exclusive jurisdiction of its courts.
			</p>

			<h2>9. Contact us</h2>
			<p>
				Questions? Email us at <a href="mailto:support@wannaverse.com">support@wannaverse.com</a>.
			</p>
		</LegalPage>
	);
}
