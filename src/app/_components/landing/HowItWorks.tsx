"use client";

import Reveal from "../shared/Reveal";
import VotingCards from "../room/VotingCards";
import ParticipantList from "../room/ParticipantList";
import RevealResults from "../room/RevealResults";
import RoomShare from "../room/RoomShare";
import { NO_CARD, Participant, RevealedVote } from "@/lib/types";
import style from "./HowItWorks.module.css";

const PEOPLE: Participant[] = [
	{ userId: "u-alex", displayName: "Alex" },
	{ userId: "u-mara", displayName: "Mara" },
	{ userId: "u-sam", displayName: "Sam" },
	{ userId: "u-jin", displayName: "Jin" },
];

const CARDS = ["0", "1", "2", "3", "5", "8", "13"];

const REVEAL: RevealedVote[] = [
	{ userId: "u-alex", vote: "5" },
	{ userId: "u-mara", vote: "5" },
	{ userId: "u-sam", vote: "8" },
	{ userId: "u-jin", vote: "3" },
];

const EMPTY = new Set<string>();
const VOTED = new Set(["u-alex", "u-mara", "u-sam"]);
const noop = () => {};
const nameFor = (id: string) => PEOPLE.find((p) => p.userId === id)?.displayName ?? "";

type Kind = "create" | "share" | "vote" | "reveal";

const STEPS: { title: string; body: string; status: string; kind: Kind }[] = [
	{
		title: "Create a room",
		body: "Name the session and pick a deck. Your room is ready instantly with a link to share.",
		status: "Room created",
		kind: "create",
	},
	{
		title: "Share the link",
		body: "Teammates open the link and join with just a display name. No accounts, no installs.",
		status: "Team joining",
		kind: "share",
	},
	{
		title: "Vote in real time",
		body: "Set the ticket and everyone picks a card. You see who has voted the moment they do.",
		status: "Voting open",
		kind: "vote",
	},
	{
		title: "Reveal and align",
		body: "Flip the cards to see the spread and the average, discuss outliers and lock it in.",
		status: "Estimate agreed",
		kind: "reveal",
	},
];

function Frame({ status, children }: { status: string; children: React.ReactNode }) {
	return (
		<div className={style.frame}>
			<div className={style.frameHead}>
				<span className={style.roomName}>Sprint 24 planning</span>
				<span className={style.statusPill}>{status}</span>
			</div>
			{children}
		</div>
	);
}

function StepVisual({ kind }: { kind: Kind }) {
	if (kind === "create") {
		return (
			<Frame status="Room created">
				<RoomShare roomId="PP-4F2A9" />
				<VotingCards
					cards={CARDS}
					selectedVote={null}
					votingOpen={false}
					currentCard={NO_CARD}
					onVote={noop}
				/>
			</Frame>
		);
	}
	if (kind === "share") {
		return (
			<Frame status="Team joining">
				<RoomShare roomId="PP-4F2A9" />
				<ParticipantList participants={PEOPLE} votedUserIds={EMPTY} votingOpen={false} />
			</Frame>
		);
	}
	if (kind === "vote") {
		return (
			<Frame status="Voting open">
				<div className={style.voteGrid}>
					<VotingCards
						cards={CARDS}
						selectedVote="5"
						votingOpen
						currentCard="PROJ-128 Checkout refactor"
						onVote={noop}
					/>
					<ParticipantList participants={PEOPLE} votedUserIds={VOTED} votingOpen />
				</div>
			</Frame>
		);
	}
	return (
		<Frame status="Estimate agreed">
			<RevealResults votes={REVEAL} displayNameFor={nameFor} />
		</Frame>
	);
}

export default function HowItWorks() {
	return (
		<section id="how" className={style.wrap}>
			<div className={`container ${style.section}`}>
				<Reveal className={style.head}>
					<span className="eyebrow">How it works</span>
					<h2 className={style.title}>From backlog to estimate in four steps</h2>
					<p className={style.sub}>
						No setup and no accounts. Go from a ticket to an agreed estimate in minutes.
					</p>
				</Reveal>

				<ol className={style.timeline}>
					{STEPS.map((step, index) => (
						<Reveal as="li" key={step.title} className={style.step}>
							<div className={style.marker}>
								<span className={style.num}>{String(index + 1).padStart(2, "0")}</span>
							</div>
							<div className={style.content}>
								<span className={style.stepLabel}>
									Step {String(index + 1).padStart(2, "0")} <span className={style.stepOf}>/ 04</span>
								</span>
								<h3 className={style.stepTitle}>{step.title}</h3>
								<p className={style.stepBody}>{step.body}</p>
								<div className={style.visual}>
									<StepVisual kind={step.kind} />
								</div>
							</div>
						</Reveal>
					))}
				</ol>
			</div>
		</section>
	);
}
