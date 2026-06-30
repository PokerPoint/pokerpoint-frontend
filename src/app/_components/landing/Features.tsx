"use client";

import { ReactNode } from "react";
import { Check, Play } from "lucide-react";
import Reveal from "../shared/Reveal";
import VotingCards from "../room/VotingCards";
import RevealResults from "../room/RevealResults";
import { RevealedVote } from "@/lib/types";
import style from "./Features.module.css";

const noop = () => {};

const REVEAL: RevealedVote[] = [
	{ userId: "a", vote: "5" },
	{ userId: "m", vote: "5" },
	{ userId: "s", vote: "8" },
	{ userId: "j", vote: "3" },
];
const NAMES: Record<string, string> = { a: "Alex", m: "Mara", s: "Sam", j: "Jin" };
const nameFor = (id: string) => NAMES[id] ?? "";

function VoteShowcase() {
	return (
		<div className={style.frame}>
			<VotingCards
				cards={["0", "1", "2", "3", "5", "8", "13"]}
				selectedVote="5"
				votingOpen
				currentCard="PROJ-128 Checkout refactor"
				onVote={noop}
			/>
		</div>
	);
}

function RevealShowcase() {
	return (
		<div className={style.frame}>
			<RevealResults votes={REVEAL} displayNameFor={nameFor} />
		</div>
	);
}

function JiraShowcase() {
	const tickets = [
		{ key: "PROJ-128", summary: "Checkout refactor" },
		{ key: "PROJ-131", summary: "Rate-limit the public API" },
		{ key: "PROJ-134", summary: "Onboarding empty states" },
	];
	return (
		<div className={style.frame}>
			<span className={style.frameLabel}>Import from Jira</span>
			<div className={style.jqlRow}>
				<span className={style.jql}>project = PROJ AND status = &quot;To Do&quot;</span>
				<span className={style.jqlBtn}>Fetch</span>
			</div>
			<ul className={style.tickets}>
				{tickets.map((t) => (
					<li key={t.key} className={style.ticket}>
						<span className={style.ticketText}>
							<strong>{t.key}</strong> {t.summary}
						</span>
						<span className={style.ticketBtn}>
							<Play size={13} />
							Vote
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function DeckShowcase() {
	return (
		<div className={style.frame}>
			<span className={style.frameLabel}>Estimation values</span>
			<div className={style.deckInput}>0, 1, 2, 3, 5, 8, 13</div>
			<div className={style.deckChips}>
				<span className={`${style.deckChip} ${style.deckChipActive}`}>Fibonacci</span>
				<span className={style.deckChip}>T-shirt</span>
				<span className={style.deckChip}>Custom</span>
			</div>
			<div className={style.deckCards}>
				{["0", "1", "2", "3", "5", "8", "13"].map((v) => (
					<span key={v} className={style.deckCard}>
						{v}
					</span>
				))}
			</div>
		</div>
	);
}

const SPOTLIGHTS: {
	label: string;
	title: string;
	body: string;
	points: string[];
	visual: ReactNode;
}[] = [
	{
		label: "Vote",
		title: "Estimate together, in real time.",
		body: "Set the ticket and the whole room votes at once. Cards stay hidden until you reveal, so nobody is anchored by the first number.",
		points: ["Live voting on any deck", "See who has voted instantly", "Start a new round in one click"],
		visual: <VoteShowcase />,
	},
	{
		label: "Reveal",
		title: "Reveal the spread, not just a number.",
		body: "Flip the cards and see the whole distribution at a glance, plus the average and where the team already agrees.",
		points: ["Distribution chart on reveal", "Average and consensus", "See exactly who voted what"],
		visual: <RevealShowcase />,
	},
	{
		label: "Integrate",
		title: "Pull tickets straight from Jira.",
		body: "Link Jira once, then fetch the work you are refining with any JQL query and point it without ever leaving the room.",
		points: ["Link Jira with OAuth", "Fetch with any JQL query", "Send a ticket to vote in one click"],
		visual: <JiraShowcase />,
	},
	{
		label: "Customise",
		title: "Bring your own deck.",
		body: "Estimate the way your team already does. Pick a preset or type your own scale when you create the room.",
		points: ["Fibonacci and t-shirt presets", "Any comma-separated scale", "Set per room at creation"],
		visual: <DeckShowcase />,
	},
];

const MANIFEST: [string, string][] = [
	["Shareable links", "Every room has its own URL"],
	["No sign-up", "Join with just a display name"],
	["Unlimited rooms", "No cap on sessions"],
	["Unlimited people", "Invite the whole org"],
	["Real-time sync", "Everyone sees changes instantly"],
	["Open source", "Free, forever, on GitHub"],
	["Keyboard voting", "Press a number to cast a vote"],
	["Light and dark", "Themes with an orange accent"],
];

export default function Features() {
	return (
		<section id="features" className={style.wrap}>
			<div className={`container ${style.section}`}>
				<Reveal className={style.head}>
					<span className="eyebrow">Features</span>
					<h2 className={style.title}>The whole estimation loop, feature by feature</h2>
					<p className={style.sub}>
						From a sized backlog to an agreed estimate, here is how each part works and what it looks
						like in the app. Everything is free.
					</p>
				</Reveal>

				<div className={style.spotlights}>
					{SPOTLIGHTS.map((s, index) => (
						<Reveal
							key={s.label}
							className={`${style.spotlight} ${index % 2 === 1 ? style.flip : ""}`}
						>
							<div className={style.text}>
								<span className={style.label}>{s.label}</span>
								<h3 className={style.spotTitle}>{s.title}</h3>
								<p className={style.spotBody}>{s.body}</p>
								<ul className={style.points}>
									{s.points.map((p) => (
										<li key={p}>
											<Check size={16} className={style.pointIcon} />
											{p}
										</li>
									))}
								</ul>
							</div>
							<div className={style.visual}>{s.visual}</div>
						</Reveal>
					))}
				</div>

				<Reveal className={style.manifestHead}>
					<h3 className={style.manifestTitle}>And the rest of the kit</h3>
					<span className={style.manifestNote}>included for every team</span>
				</Reveal>
				<ul className={style.manifest}>
					{MANIFEST.map(([name, desc], i) => (
						<li key={name} className={`${style.spec} ${i % 2 === 0 ? style.specLeft : style.specRight}`}>
							<span className={style.specDot} />
							<span className={style.specName}>{name}</span>
							<span className={style.specDesc}>{desc}</span>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
