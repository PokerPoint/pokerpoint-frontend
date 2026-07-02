"use client";

import Script from "next/script";
import { CONSENT_STORAGE_KEY, GA_MEASUREMENT_ID } from "@/lib/consent";

export default function Analytics() {
	return (
		<>
			<Script id="ga-consent-init" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					window.gtag = gtag;
					var stored = null;
					try { stored = window.localStorage.getItem('${CONSENT_STORAGE_KEY}'); } catch (e) {}
					gtag('consent', 'default', {
						ad_storage: 'denied',
						ad_user_data: 'denied',
						ad_personalization: 'denied',
						analytics_storage: stored === 'granted' ? 'granted' : 'denied',
					});
					gtag('js', new Date());
					gtag('config', '${GA_MEASUREMENT_ID}');
				`}
			</Script>
			<Script
				src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
				strategy="afterInteractive"
			/>
		</>
	);
}
