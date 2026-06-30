import { Check, Users } from "lucide-react";
import { Participant } from "@/lib/types";
import style from "./ParticipantList.module.css";

interface Props {
	participants: Participant[];
	votedUserIds: Set<string>;
	votingOpen: boolean;
}

export default function ParticipantList({ participants, votedUserIds, votingOpen }: Props) {
	const votedCount = participants.filter((p) => votedUserIds.has(p.userId)).length;

	return (
		<aside className={style.panel}>
			<header className={style.head}>
				<span className={style.title}>
					<Users size={17} />
					Team
				</span>
				{votingOpen && (
					<span className={style.count}>
						{votedCount}/{participants.length} voted
					</span>
				)}
			</header>
			<ul className={style.list}>
				{participants.map((p) => {
					const voted = votedUserIds.has(p.userId);
					return (
						<li key={p.userId} className={style.row}>
							<span className={style.avatar}>{p.displayName.charAt(0).toUpperCase()}</span>
							<span className={style.name}>{p.displayName}</span>
							{votingOpen && (
								<span className={`${style.status} ${voted ? style.done : ""}`}>
									{voted ? <Check size={15} /> : null}
								</span>
							)}
						</li>
					);
				})}
				{participants.length === 0 && <li className={style.empty}>Waiting for people to join</li>}
			</ul>
		</aside>
	);
}
