"use client";

import { FormEvent, useState } from "react";
import Glass from "../shared/Glass";
import Button from "../shared/Button";
import Spinner from "../shared/Spinner";
import { useToast } from "../shared/Toast";
import { cardPresets } from "@/lib/config";
import style from "./SetupPanel.module.css";

interface Props {
	defaultRoomId: string;
	defaultName: string;
	onCreate: (roomName: string, cards: string[]) => Promise<string>;
	onJoin: (roomId: string, displayName: string) => Promise<void>;
}

type Tab = "create" | "join";

export default function SetupPanel({ defaultRoomId, defaultName, onCreate, onJoin }: Props) {
	const { notify } = useToast();
	const [tab, setTab] = useState<Tab>(defaultRoomId ? "join" : "create");
	const [roomName, setRoomName] = useState("");
	const [cardsText, setCardsText] = useState(cardPresets.fibonacci.join(", "));
	const [joinRoomId, setJoinRoomId] = useState(defaultRoomId);
	const [displayName, setDisplayName] = useState(defaultName);
	const [creating, setCreating] = useState(false);
	const [joining, setJoining] = useState(false);

	const parseCards = (raw: string) =>
		raw
			.split(",")
			.map((c) => c.trim())
			.filter(Boolean);

	async function handleCreate(event: FormEvent) {
		event.preventDefault();
		const cards = parseCards(cardsText);
		if (!roomName.trim() || cards.length === 0) {
			notify("Add a room name and at least one card", "error");
			return;
		}
		setCreating(true);
		try {
			const newRoomId = await onCreate(roomName.trim(), cards);
			setJoinRoomId(newRoomId);
			setTab("join");
			if (displayName.trim()) {
				await onJoin(newRoomId, displayName.trim());
			} else {
				notify("Room created, add your name to join", "success");
			}
		} catch (error) {
			notify(error instanceof Error ? error.message : "Could not create room", "error");
		} finally {
			setCreating(false);
		}
	}

	async function handleJoin(event: FormEvent) {
		event.preventDefault();
		if (!joinRoomId.trim() || !displayName.trim()) {
			notify("Enter a room ID and your name", "error");
			return;
		}
		setJoining(true);
		try {
			await onJoin(joinRoomId.trim(), displayName.trim());
		} catch (error) {
			notify(error instanceof Error ? error.message : "Could not join room", "error");
		} finally {
			setJoining(false);
		}
	}

	return (
		<div className={style.wrap}>
			<div className={style.intro}>
				<h1 className={style.heading}>Start estimating</h1>
				<p className={style.sub}>Create a room or join one with an ID. It takes seconds.</p>
			</div>

			<Glass className={style.card}>
				<div className={style.tabs} role="tablist">
					<button
						type="button"
						role="tab"
						aria-selected={tab === "create"}
						className={`${style.tab} ${tab === "create" ? style.active : ""}`}
						onClick={() => setTab("create")}
					>
						Create room
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={tab === "join"}
						className={`${style.tab} ${tab === "join" ? style.active : ""}`}
						onClick={() => setTab("join")}
					>
						Join room
					</button>
				</div>

				{tab === "create" ? (
					<form className={style.form} onSubmit={handleCreate}>
						<label className={style.field}>
							<span className={style.label}>Room name</span>
							<input
								className={style.input}
								value={roomName}
								onChange={(e) => setRoomName(e.target.value)}
								placeholder="Sprint 24 estimation"
								autoFocus
							/>
						</label>
						<label className={style.field}>
							<span className={style.label}>Estimation values</span>
							<input
								className={style.input}
								value={cardsText}
								onChange={(e) => setCardsText(e.target.value)}
								placeholder="0, 1, 2, 3, 5, 8, 13"
							/>
						</label>
						<div className={style.presets}>
							<span className={style.presetLabel}>Quick deck</span>
							<button
								type="button"
								className={style.preset}
								onClick={() => setCardsText(cardPresets.fibonacci.join(", "))}
							>
								Fibonacci
							</button>
							<button
								type="button"
								className={style.preset}
								onClick={() => setCardsText(cardPresets.tShirt.join(", "))}
							>
								T-shirt sizes
							</button>
						</div>
						<Button type="submit" size="lg" disabled={creating} className={style.submit}>
							{creating ? <Spinner label="Creating" /> : "Create room"}
						</Button>
					</form>
				) : (
					<form className={style.form} onSubmit={handleJoin}>
						<label className={style.field}>
							<span className={style.label}>Room ID</span>
							<input
								className={style.input}
								value={joinRoomId}
								onChange={(e) => setJoinRoomId(e.target.value)}
								placeholder="Paste the room ID"
							/>
						</label>
						<label className={style.field}>
							<span className={style.label}>Your name</span>
							<input
								className={style.input}
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								placeholder="Alex"
							/>
						</label>
						<Button type="submit" size="lg" disabled={joining} className={style.submit}>
							{joining ? <Spinner label="Joining" /> : "Join room"}
						</Button>
					</form>
				)}
			</Glass>
		</div>
	);
}
