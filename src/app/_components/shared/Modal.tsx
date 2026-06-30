"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import style from "./Modal.module.css";

interface Props {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: Props) {
	useEffect(() => {
		if (!open) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className={style.overlay} onClick={onClose} role="presentation">
			<div
				className={style.panel}
				role="dialog"
				aria-modal="true"
				aria-label={title}
				onClick={(event) => event.stopPropagation()}
			>
				<div className={style.head}>
					<h2 className={style.title}>{title}</h2>
					<button type="button" className={style.close} aria-label="Close" onClick={onClose}>
						<X size={20} />
					</button>
				</div>
				<div className={style.body}>{children}</div>
			</div>
		</div>
	);
}
