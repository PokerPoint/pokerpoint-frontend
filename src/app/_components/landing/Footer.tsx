import Link from "next/link";
import Logo from "../shared/Logo";
import style from "./Footer.module.css";

const columns = [
	{
		title: "Product",
		links: [
			{ label: "How it works", href: "/#how" },
			{ label: "Features", href: "/#features" },
			{ label: "Launch app", href: "/app/" },
		],
	},
	{
		title: "Community",
		links: [
			{ label: "GitHub", href: "https://github.com/PokerPoint" },
			{ label: "Open Collective", href: "https://opencollective.com/pokerpoint" },
		],
	},
	{
		title: "Site",
		links: [
			{ label: "Privacy policy", href: "/privacy/" },
			{ label: "Terms of service", href: "/terms/" },
		],
	},
];

export default function Footer() {
	return (
		<footer className={style.footer}>
			<div className={`container ${style.inner}`}>
				<div className={style.brand}>
					<Logo />
					<p className={style.tagline}>
						Free, real-time planning poker for agile teams. Open and accessible for everyone.
					</p>
				</div>
				<div className={style.columns}>
					{columns.map((column) => (
						<nav key={column.title} className={style.column}>
							<h4 className={style.colTitle}>{column.title}</h4>
							<ul>
								{column.links.map((link) => (
									<li key={link.label}>
										{link.href.startsWith("http") ? (
											<a href={link.href}>{link.label}</a>
										) : (
											<Link href={link.href}>{link.label}</Link>
										)}
									</li>
								))}
							</ul>
						</nav>
					))}
				</div>
			</div>
			<div className={`container ${style.bottom}`}>
				<span>&copy; 2026 PokerPoint. All rights reserved.</span>
			</div>
		</footer>
	);
}
