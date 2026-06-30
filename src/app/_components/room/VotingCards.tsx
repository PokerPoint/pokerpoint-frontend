"use client";

import { useEffect } from "react";
import style from "./VotingCards.module.css";

interface Props {
	cards: string[];
	selectedVote: string | null;
	votingOpen: boolean;
	currentCard: string;
	onVote: (value: string) => void;
}

export default function VotingCards({ cards, selectedVote, votingOpen, currentCard, onVote }: Props) {
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
			<header className={style.head}>
				<div>
					<span className={style.eyebrow}>Now estimating</span>
					<h2 className={style.task}>{votingOpen ? currentCard : "Waiting for the next ticket"}</h2>
				</div>
				{selectedVote !== null && votingOpen && (
					<span className={style.your}>
						Your vote
						<strong>{selectedVote}</strong>
					</span>
				)}
			</header>

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

			{!votingOpen && (
				<p className={style.hint}>
					The room owner has not opened a ticket yet. Hang tight, voting starts when a ticket is
					set.
				</p>
			)}
			{votingOpen && <p className={style.hint}>Tip: press the number on a card to vote.</p>}
		</section>
	);
}
