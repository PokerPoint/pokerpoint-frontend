import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import style from "./LegalPage.module.css";

interface Props {
	title: string;
	effectiveDate: string;
	children: ReactNode;
}

export default function LegalPage({ title, effectiveDate, children }: Props) {
	return (
		<>
			<Navbar />
			<main className={`container ${style.wrap}`}>
				<header className={style.head}>
					<h1 className={style.title}>{title}</h1>
					<p className={style.date}>Effective date: {effectiveDate}</p>
				</header>
				<article className={style.prose}>{children}</article>
			</main>
			<Footer />
		</>
	);
}
