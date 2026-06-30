"use client";

import { useState } from "react";
import { Play, Plus } from "lucide-react";
import Button from "../shared/Button";
import style from "./TicketPanel.module.css";

interface Ticket {
	id: string;
	text: string;
}

interface Props {
	onSetCard: (name: string) => void;
}

export default function TicketPanel({ onSetCard }: Props) {
	const [draft, setDraft] = useState("");
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [seq, setSeq] = useState(0);

	function add() {
		const lines = draft
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);
		if (lines.length === 0) return;
		let next = seq;
		const created = lines.map((text) => ({ id: `manual-${next++}`, text }));
		setSeq(next);
		setTickets((prev) => [...prev, ...created]);
		setDraft("");
	}

	function start(ticket: Ticket) {
		onSetCard(ticket.text);
		setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
	}

	return (
		<div className={style.panel}>
			<h3 className={style.title}>Tickets</h3>
			<p className={style.sub}>Paste one ticket per line, then start voting on each.</p>
			<textarea
				className={style.textarea}
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				rows={3}
				placeholder={"PROJ-101 Update onboarding\nPROJ-102 Fix billing webhook"}
			/>
			<Button type="button" variant="subtle" onClick={add} className={style.add}>
				<Plus size={16} />
				Add tickets
			</Button>

			{tickets.length > 0 && (
				<ul className={style.list}>
					{tickets.map((ticket) => (
						<li key={ticket.id} className={style.row}>
							<span className={style.text}>{ticket.text}</span>
							<button type="button" className={style.start} onClick={() => start(ticket)}>
								<Play size={14} />
								Vote
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
