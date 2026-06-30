"use client";

import { useState } from "react";
import { GripVertical, Play, Plus, X } from "lucide-react";
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
	const [currentId, setCurrentId] = useState<string | null>(null);
	const [dragIndex, setDragIndex] = useState<number | null>(null);

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
		setCurrentId(ticket.id);
	}

	function remove(id: string) {
		setTickets((prev) => prev.filter((t) => t.id !== id));
		setCurrentId((prev) => (prev === id ? null : prev));
	}

	function reorder(from: number, to: number) {
		setTickets((prev) => {
			if (from === to || from < 0 || to < 0 || to >= prev.length) return prev;
			const next = [...prev];
			const [moved] = next.splice(from, 1);
			next.splice(to, 0, moved);
			return next;
		});
	}

	return (
		<div className={style.panel}>
			<div className={style.head}>
				<span className={style.label}>Tickets</span>
				{tickets.length > 0 && <span className={style.count}>{tickets.length}</span>}
			</div>
			<p className={style.sub}>Paste one per line. Drag to reorder, play to start voting.</p>
			<textarea
				className={style.textarea}
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				rows={3}
				placeholder={"PROJ-101 Update onboarding\nPROJ-102 Fix billing webhook"}
			/>
			<Button type="button" variant="ghost" onClick={add} className={style.add}>
				<Plus size={16} />
				Add tickets
			</Button>

			{tickets.length > 0 && (
				<ul className={style.list}>
					{tickets.map((ticket, index) => (
						<li
							key={ticket.id}
							draggable
							onDragStart={() => setDragIndex(index)}
							onDragEnter={() => {
								if (dragIndex !== null && dragIndex !== index) {
									reorder(dragIndex, index);
									setDragIndex(index);
								}
							}}
							onDragOver={(e) => e.preventDefault()}
							onDragEnd={() => setDragIndex(null)}
							className={`${style.row} ${ticket.id === currentId ? style.current : ""} ${
								dragIndex === index ? style.dragging : ""
							}`}
						>
							<span className={style.grip} aria-hidden="true">
								<GripVertical size={15} />
							</span>
							<span className={style.text}>{ticket.text}</span>
							{ticket.id === currentId && <span className={style.badge}>Voting</span>}
							<button
								type="button"
								className={style.iconBtn}
								title="Start voting on this ticket"
								onClick={() => start(ticket)}
							>
								<Play size={14} />
							</button>
							<button
								type="button"
								className={`${style.iconBtn} ${style.removeBtn}`}
								title="Remove ticket"
								onClick={() => remove(ticket.id)}
							>
								<X size={14} />
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
