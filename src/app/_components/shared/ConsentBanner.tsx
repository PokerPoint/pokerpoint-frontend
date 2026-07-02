"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { ConsentChoice, readConsent, updateGtagConsent, writeConsent } from "@/lib/consent";
import style from "./ConsentBanner.module.css";

export default function ConsentBanner() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (readConsent() === null) {
			setVisible(true);
		}
	}, []);

	function choose(choice: ConsentChoice) {
		writeConsent(choice);
		updateGtagConsent(choice);
		setVisible(false);
	}

	if (!visible) {
		return null;
	}

	return (
		<div className={style.banner} role="dialog" aria-label="Cookie consent" aria-live="polite">
			<div className={style.body}>
				<Cookie size={20} className={style.icon} aria-hidden />
				<p className={style.text}>
					We use Google Analytics to understand how PokerPoint is used. Analytics cookies are only
					set with your consent. See our <Link href="/privacy/">Privacy Policy</Link>.
				</p>
			</div>
			<div className={style.actions}>
				<button type="button" className={style.reject} onClick={() => choose("denied")}>
					Reject
				</button>
				<button type="button" className={style.accept} onClick={() => choose("granted")}>
					Accept
				</button>
			</div>
		</div>
	);
}
