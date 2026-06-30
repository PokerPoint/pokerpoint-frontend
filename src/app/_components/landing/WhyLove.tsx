import Reveal from "../shared/Reveal";
import style from "./WhyLove.module.css";

const items = [
	{
		title: "Unlimited Rooms",
		body: "Create as many rooms as your team needs. No restrictions and no sign-ins to slow you down.",
	},
	{
		title: "Unlimited Participants",
		body: "Invite anyone to join. It works just as well for a squad of three as it does the whole org.",
	},
	{
		title: "Free Forever",
		body: "No hidden costs and no paywall. Open and accessible for every agile team out there.",
	},
];

export default function WhyLove() {
	return (
		<section id="why" className={style.wrap}>
			<div className={`container ${style.inner}`}>
				<Reveal className={style.head}>
					<span className="eyebrow">Why teams choose it</span>
					<h2 className={style.title}>Why Teams Love PokerPoint</h2>
				</Reveal>
				<div className={style.grid}>
					{items.map((item, index) => (
						<Reveal key={item.title} delay={120 + index * 110} className={style.item}>
							<span className={style.rule} />
							<h3 className={style.itemTitle}>{item.title}</h3>
							<p className={style.itemBody}>{item.body}</p>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
