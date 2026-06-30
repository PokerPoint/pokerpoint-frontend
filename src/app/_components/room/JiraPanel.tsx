"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import Button from "../shared/Button";
import Spinner from "../shared/Spinner";
import { useToast } from "../shared/Toast";
import { buildJiraAuthUrl } from "@/lib/jira";
import { storage } from "@/lib/storage";
import { JiraTicket } from "@/lib/types";
import style from "./JiraPanel.module.css";

interface Props {
	roomId: string;
	tickets: JiraTicket[];
	onFetch: (jql: string) => void;
	onSetCard: (name: string) => void;
}

export default function JiraPanel({ roomId, tickets, onFetch, onSetCard }: Props) {
	const { notify } = useToast();
	const [linked, setLinked] = useState(false);
	const [jql, setJql] = useState("");
	const [fetching, setFetching] = useState(false);
	const [hidden, setHidden] = useState<Set<string>>(new Set());

	useEffect(() => {
		setLinked(Boolean(storage.getJiraLinked()));
	}, []);

	useEffect(() => {
		setFetching(false);
	}, [tickets]);

	function fetchTickets() {
		if (!jql.trim()) {
			notify("Enter a JQL query", "error");
			return;
		}
		setFetching(true);
		setHidden(new Set());
		onFetch(jql.trim());
	}

	function start(ticket: JiraTicket) {
		onSetCard(`${ticket.key}: ${ticket.summary}`);
		setHidden((prev) => new Set(prev).add(ticket.key));
	}

	if (!linked) {
		return (
			<div className={style.panel}>
				<h3 className={style.title}>Import from Jira</h3>
				<p className={style.sub}>Link your Jira account to pull tickets with JQL.</p>
				<Button type="button" href={buildJiraAuthUrl(roomId)} variant="subtle" className={style.link}>
					Link Jira
				</Button>
			</div>
		);
	}

	const visible = tickets.filter((t) => !hidden.has(t.key));

	return (
		<div className={style.panel}>
			<h3 className={style.title}>Import from Jira</h3>
			<div className={style.row}>
				<input
					className={style.input}
					value={jql}
					onChange={(e) => setJql(e.target.value)}
					placeholder="project = PROJ AND status = 'To Do'"
				/>
				<Button type="button" variant="subtle" onClick={fetchTickets} disabled={fetching}>
					{fetching ? <Spinner /> : "Fetch"}
				</Button>
			</div>

			{visible.length > 0 && (
				<ul className={style.list}>
					{visible.map((ticket) => (
						<li key={ticket.key} className={style.ticket}>
							<span className={style.text}>
								<strong>{ticket.key}</strong> {ticket.summary}
							</span>
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
