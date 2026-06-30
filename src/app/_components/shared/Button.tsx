import Link from "next/link";
import { ComponentPropsWithoutRef, ReactNode } from "react";
import style from "./Button.module.css";

type Variant = "primary" | "ghost" | "subtle";
type Size = "md" | "lg";

interface OwnProps {
	variant?: Variant;
	size?: Size;
	children: ReactNode;
}

type AnchorProps = OwnProps & { href: string } & ComponentPropsWithoutRef<"a">;
type NativeProps = OwnProps & { href?: undefined } & ComponentPropsWithoutRef<"button">;
type Props = AnchorProps | NativeProps;

export default function Button({
	variant = "primary",
	size = "md",
	className,
	children,
	...rest
}: Props) {
	const cls = [style.btn, style[variant], style[size], className].filter(Boolean).join(" ");

	if ("href" in rest && rest.href !== undefined) {
		const { href, ...anchor } = rest as AnchorProps;
		if (href.startsWith("/")) {
			return (
				<Link href={href} className={cls} {...anchor}>
					{children}
				</Link>
			);
		}
		return (
			<a href={href} className={cls} {...anchor}>
				{children}
			</a>
		);
	}

	return (
		<button className={cls} {...(rest as ComponentPropsWithoutRef<"button">)}>
			{children}
		</button>
	);
}
