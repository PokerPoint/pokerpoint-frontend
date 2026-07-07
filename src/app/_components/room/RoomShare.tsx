"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { canonicalRoomUrl, roomUrl } from "@/lib/config";
import { useToast } from "../shared/Toast";
import style from "./RoomShare.module.css";

interface Props {
	roomId: string;
}

export default function RoomShare({ roomId }: Props) {
	const { notify } = useToast();
	const [copied, setCopied] = useState(false);
	// Render the canonical URL first so server and client markup match,
	// then swap to the local origin once mounted.
	const [url, setUrl] = useState(() => canonicalRoomUrl(roomId));
	useEffect(() => {
		setUrl(roomUrl(roomId));
	}, [roomId]);

	async function copy() {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			notify("Room link copied", "success");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			notify("Could not copy the link", "error");
		}
	}

	return (
		<div className={style.share}>
			<span className={style.icon}>
				<Link2 size={16} />
			</span>
			<span className={style.url} title={url}>
				{url}
			</span>
			<button type="button" className={style.copy} onClick={copy}>
				{copied ? <Check size={15} /> : <Copy size={15} />}
				{copied ? "Copied" : "Copy"}
			</button>
		</div>
	);
}
