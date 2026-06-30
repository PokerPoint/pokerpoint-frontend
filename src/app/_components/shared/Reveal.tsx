"use client";

import { ElementType, ReactNode, useEffect, useRef, useState } from "react";

interface Props {
	children: ReactNode;
	as?: ElementType;
	delay?: number;
	className?: string;
}

export default function Reveal({ children, as: Tag = "div", delay = 0, className = "" }: Props) {
	const ref = useRef<HTMLElement | null>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (typeof IntersectionObserver === "undefined") {
			setVisible(true);
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<Tag
			ref={ref}
			className={`reveal ${visible ? "is-visible" : ""} ${className}`}
			style={delay ? { transitionDelay: `${delay}ms` } : undefined}
		>
			{children}
		</Tag>
	);
}
