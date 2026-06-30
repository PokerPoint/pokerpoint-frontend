import Link from "next/link";
import style from "./Logo.module.css";

interface Props {
	href?: string;
	className?: string;
}

export default function Logo({ href = "/", className }: Props) {
	return (
		<Link href={href} className={[style.logo, className].filter(Boolean).join(" ")} aria-label="PokerPoint home">
			<img src="/logo.svg" alt="PokerPoint" className={style.dark} />
			<img src="/logo-light.svg" alt="PokerPoint" className={style.light} />
		</Link>
	);
}
