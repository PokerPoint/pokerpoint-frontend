import Logo from "../shared/Logo";
import Button from "../shared/Button";
import ThemeToggle from "../shared/ThemeToggle";
import style from "./Navbar.module.css";

export default function Navbar() {
	return (
		<header className={style.header}>
			<nav className={`container ${style.nav}`}>
				<Logo />
				<div className={style.links}>
					<a href="#features" className={style.link}>
						Features
					</a>
					<a href="#how" className={style.link}>
						How it works
					</a>
				</div>
				<div className={style.actions}>
					<ThemeToggle />
					<Button href="/app/">Launch app</Button>
				</div>
			</nav>
		</header>
	);
}
