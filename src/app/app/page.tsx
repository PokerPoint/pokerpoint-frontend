"use client";

import { useEffect, useRef, useState } from "react";
import AppHeader from "../_components/room/AppHeader";
import SetupPanel from "../_components/room/SetupPanel";
import RoomSession from "../_components/room/RoomSession";
import Spinner from "../_components/shared/Spinner";
import { useToast } from "../_components/shared/Toast";
import { useRoom } from "@/hooks/useRoom";
import { storage } from "@/lib/storage";
import { createRoom, roomExists } from "@/lib/api";
import style from "./page.module.css";

export default function AppPage() {
	const room = useRoom();
	const { notify } = useToast();
	const [defaults, setDefaults] = useState({ roomId: "", name: "" });
	const [ready, setReady] = useState(false);
	const started = useRef(false);

	useEffect(() => {
		if (started.current) return;
		started.current = true;

		const params = new URLSearchParams(window.location.search);
		const jira = params.get("jira");
		storage.setJiraLinked(jira ? jira : null);

		const rid = params.get("roomId") ?? "";
		const name = storage.getDisplayName();
		setDefaults({ roomId: rid, name });
		setReady(true);

		if (rid && name) {
			attemptJoin(rid, name).catch((error) => {
				notify(error instanceof Error ? error.message : "Could not rejoin room", "error");
			});
		}
	}, [room.join]);

	useEffect(() => {
		if (room.status === "disconnected") {
			notify("You were disconnected from the room", "error");
			room.leave();
		}
	}, [room.status, room.leave, notify]);

	async function attemptJoin(roomId: string, displayName: string) {
		const exists = await roomExists(roomId);
		if (!exists) {
			throw new Error("That room does not exist");
		}
		window.history.replaceState(null, "", `/app/?roomId=${encodeURIComponent(roomId)}`);
		room.join(roomId, displayName);
	}

	async function handleCreate(roomName: string, cards: string[]): Promise<string> {
		const result = await createRoom(roomName, cards, storage.getUserUUID());
		window.history.replaceState(null, "", `/app/?roomId=${encodeURIComponent(result.roomId)}`);
		return result.roomId;
	}

	if (room.status === "joined") {
		return (
			<div className={style.app}>
				<RoomSession room={room} />
			</div>
		);
	}

	return (
		<div className={style.app}>
			<AppHeader />
			{room.status === "joining" ? (
				<div className={style.loading}>
					<Spinner label="Joining room" />
				</div>
			) : (
				ready && (
					<main className={`container ${style.setup}`}>
						<SetupPanel
							defaultRoomId={defaults.roomId}
							defaultName={defaults.name}
							onCreate={handleCreate}
							onJoin={attemptJoin}
						/>
					</main>
				)
			)}
		</div>
	);
}
