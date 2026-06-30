"use client";

import { ReactNode, useEffect } from "react";
import style from "./VotingCards.module.css";

interface Props {
	cards: string[];
	selectedVote: string | null;
	votingOpen: boolean;
	currentCard: string;
	onVote: (value: string) => void;
	action?: ReactNode;
	showHeader?: boolean;
}

export default function VotingCards({
	cards,
	selectedVote,
	votingOpen,
	currentCard,
	onVote,
	action,
	showHeader = true,
}: Props) {
	useEffect(() => {
		if (!votingOpen) return;
		const onKey = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
			const index = Number(event.key);
			if (!Number.isNaN(index) && index >= 1 && index <= cards.length) {
				onVote(cards[index - 1]);
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [cards, votingOpen, onVote]);

	return (
		<section className={style.panel}>
			{showHeader && (
				<header className={style.head}>
					<div className={style.heading}>
						<span className={style.label}>Now estimating</span>
						<h2 className={style.task}>
							{votingOpen ? currentCard : "Waiting for the next ticket"}
						</h2>
					</div>
					<div className={style.headActions}>
						{selectedVote !== null && votingOpen && (
							<span className={style.your}>
								Your vote
								<strong>{selectedVote}</strong>
							</span>
						)}
						{action}
					</div>
				</header>
			)}

			<div className={`${style.grid} ${votingOpen ? "" : style.closed}`}>
				{cards.map((value, index) => (
					<button
						key={value}
						type="button"
						disabled={!votingOpen}
						className={`${style.card} ${value === selectedVote ? style.selected : ""}`}
						onClick={() => onVote(value)}
					>
						<span className={style.value}>{value}</span>
						<span className={style.key}>{index < 9 ? index + 1 : ""}</span>
					</button>
				))}
			</div>

			<p className={style.hint}>
				{votingOpen
					? "Press the number on a card to vote, or click it."
					: "The room owner has not opened a ticket yet. Voting starts when a ticket is set."}
			</p>
		</section>
	);
}
