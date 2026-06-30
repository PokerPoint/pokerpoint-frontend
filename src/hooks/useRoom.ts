"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WebSocketService } from "@/lib/websocket";
import { storage } from "@/lib/storage";
import { JiraTicket, NO_CARD, Participant, RevealedVote, RoomState } from "@/lib/types";

export type RoomStatus = "idle" | "joining" | "joined" | "disconnected";

export interface UseRoom {
	status: RoomStatus;
	roomId: string | null;
	roomName: string;
	currentCard: string;
	cards: string[];
	participants: Participant[];
	votedUserIds: Set<string>;
	selectedVote: string | null;
	isOwner: boolean;
	votingOpen: boolean;
	revealedVotes: RevealedVote[] | null;
	jiraTickets: JiraTicket[];
	jiraLinked: boolean;
	displayNameFor: (userId: string) => string;
	join: (roomId: string, displayName: string) => void;
	vote: (value: string) => void;
	reveal: () => void;
	setCard: (name: string) => void;
	fetchJira: (jql: string) => void;
	closeReveal: () => void;
	leave: () => void;
}

export function useRoom(): UseRoom {
	const serviceRef = useRef<WebSocketService | null>(null);
	if (serviceRef.current === null) {
		serviceRef.current = new WebSocketService();
	}

	const [status, setStatus] = useState<RoomStatus>("idle");
	const [roomId, setRoomId] = useState<string | null>(null);
	const [roomName, setRoomName] = useState("");
	const [currentCard, setCurrentCard] = useState(NO_CARD);
	const [cards, setCards] = useState<string[]>([]);
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [votedUserIds, setVotedUserIds] = useState<Set<string>>(new Set());
	const [selectedVote, setSelectedVote] = useState<string | null>(null);
	const [isOwner, setIsOwner] = useState(false);
	const [revealedVotes, setRevealedVotes] = useState<RevealedVote[] | null>(null);
	const [jiraTickets, setJiraTickets] = useState<JiraTicket[]>([]);
	const [jiraLinked, setJiraLinked] = useState(false);

	useEffect(() => {
		setJiraLinked(Boolean(storage.getJiraLinked()));
	}, []);

	const applyState = useCallback((data: RoomState) => {
		setRoomName(data.roomName);
		setCurrentCard(data.card || NO_CARD);
		setCards(data.cards);
		setParticipants(data.participants);
		setVotedUserIds(new Set(data.votes));
		setSelectedVote(null);
		setIsOwner(data.ownerUUID === storage.getUserUUID());
		setStatus("joined");
	}, []);

	const join = useCallback(
		(nextRoomId: string, displayName: string) => {
			storage.setDisplayName(displayName);
			setRoomId(nextRoomId);
			setStatus("joining");
			serviceRef.current?.connect(nextRoomId, displayName, {
				onMessage: (message) => {
					switch (message.event) {
						case "state":
							applyState(message.data);
							break;
						case "user-join":
							setParticipants((prev) =>
								prev.some((p) => p.userId === message.data.userId)
									? prev
									: [...prev, message.data],
							);
							break;
						case "user-disconnect":
							setParticipants((prev) => prev.filter((p) => p.userId !== message.data.userId));
							setVotedUserIds((prev) => {
								const next = new Set(prev);
								next.delete(message.data.userId);
								return next;
							});
							break;
						case "vote":
							setVotedUserIds((prev) => new Set(prev).add(message.data.userId));
							break;
						case "jira":
							setJiraTickets(message.data.items);
							break;
						case "show":
							setRevealedVotes(message.data);
							setCurrentCard(NO_CARD);
							setVotedUserIds(new Set());
							setSelectedVote(null);
							break;
						case "card":
							setCurrentCard(message.data.name);
							setVotedUserIds(new Set());
							setSelectedVote(null);
							setRevealedVotes(null);
							break;
					}
				},
				onClose: () => setStatus("disconnected"),
			});
		},
		[applyState],
	);

	const vote = useCallback(
		(value: string) => {
			if (!roomId) return;
			setSelectedVote(value);
			serviceRef.current?.send({
				action: "vote",
				roomId,
				vote: value,
				userId: storage.getUserUUID(),
			});
		},
		[roomId],
	);

	const reveal = useCallback(() => {
		if (!roomId) return;
		serviceRef.current?.send({ action: "show", roomId });
	}, [roomId]);

	const setCard = useCallback(
		(name: string) => {
			if (!roomId) return;
			serviceRef.current?.send({ action: "card", roomId, name });
		},
		[roomId],
	);

	const fetchJira = useCallback(
		(jql: string) => {
			if (!roomId) return;
			serviceRef.current?.send({
				action: "jira",
				roomId,
				userId: storage.getUserUUID(),
				jql,
			});
		},
		[roomId],
	);

	const closeReveal = useCallback(() => setRevealedVotes(null), []);

	const leave = useCallback(() => {
		serviceRef.current?.disconnect();
		storage.setJiraLinked(null);
		setStatus("idle");
		setRoomId(null);
		setRoomName("");
		setCurrentCard(NO_CARD);
		setCards([]);
		setParticipants([]);
		setVotedUserIds(new Set());
		setSelectedVote(null);
		setIsOwner(false);
		setRevealedVotes(null);
		setJiraTickets([]);
	}, []);

	const nameLookup = useMemo(() => {
		const map: Record<string, string> = {};
		participants.forEach((p) => {
			map[p.userId] = p.displayName;
		});
		return map;
	}, [participants]);

	const displayNameFor = useCallback((userId: string) => nameLookup[userId] ?? "", [nameLookup]);

	return {
		status,
		roomId,
		roomName,
		currentCard,
		cards,
		participants,
		votedUserIds,
		selectedVote,
		isOwner,
		votingOpen: currentCard !== NO_CARD,
		revealedVotes,
		jiraTickets,
		jiraLinked,
		displayNameFor,
		join,
		vote,
		reveal,
		setCard,
		fetchJira,
		closeReveal,
		leave,
	};
}
