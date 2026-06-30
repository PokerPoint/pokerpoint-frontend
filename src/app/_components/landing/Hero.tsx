import Button from "../shared/Button";
import Reveal from "../shared/Reveal";
import { cardPresets } from "@/lib/config";
import style from "./Hero.module.css";

const team = [
	{ name: "Alex", initial: "A", vote: "5", voted: true },
	{ name: "Mara", initial: "M", vote: "5", voted: true },
	{ name: "Sam", initial: "S", vote: "8", voted: true },
	{ name: "Jin", initial: "J", vote: null, voted: false },
];

export default function Hero() {
	return (
		<section className={style.section}>
			<div className={`gridTexture ${style.grid}`} aria-hidden="true" />
			<div className={style.glow} aria-hidden="true" />

			<div className="container">
				<Reveal className={style.copy}>
					<span className="eyebrow">Planning poker &middot; Real-time &middot; Free</span>
					<h1 className={style.title}>
						Agile Planning Just Got Easier With <span className="accentText">PokerPoint</span>
					</h1>
					<p className={style.lead}>
						PokerPoint helps software teams estimate story points, prioritise the backlog and stay
						aligned. Spin up a room, share a link and reach consensus in real time.
					</p>
					<div className={style.cta}>
						<Button href="/app/" size="lg">
							Start pointing
						</Button>
						<Button href="#how" variant="ghost" size="lg">
							See how it works <span className={style.arrow}>&rarr;</span>
						</Button>
					</div>
					<p className={style.fineprint}>No sign-up &middot; Unlimited rooms &middot; Free and open source</p>
				</Reveal>
			</div>

			<div className={`container ${style.showcaseWrap}`}>
				<Reveal delay={120}>
					<div className={style.showcase} aria-hidden="true">
						<div className={style.board}>
							<div className={style.boardHead}>
								<span className={style.boardLabel}>Now estimating</span>
								<span className={style.boardTask}>PROJ-128 Checkout refactor</span>
							</div>
							<div className={style.cards}>
								{cardPresets.fibonacci.map((value) => (
									<span
										key={value}
										className={`${style.card} ${value === "5" ? style.cardActive : ""}`}
									>
										{value}
									</span>
								))}
							</div>
							<div className={style.boardFoot}>
								<span className={style.footMeta}>Average 4.5</span>
								<span className={style.footMeta}>3 of 4 voted</span>
							</div>
						</div>

						<div className={style.panel}>
							<span className={style.panelLabel}>Team</span>
							<ul className={style.members}>
								{team.map((m) => (
									<li key={m.name} className={style.member}>
										<span className={style.avatar}>{m.initial}</span>
										<span className={style.memberName}>{m.name}</span>
										<span className={`${style.tick} ${m.voted ? style.tickDone : ""}`} />
									</li>
								))}
							</ul>
						</div>
					</div>
				</Reveal>
				<div className={style.fade} aria-hidden="true" />
			</div>
		</section>
	);
}
