"use client";

import { Eye, RotateCcw } from "lucide-react";
import AppHeader from "./AppHeader";
import VotingCards from "./VotingCards";
import ParticipantList from "./ParticipantList";
import RoomShare from "./RoomShare";
import TicketPanel from "./TicketPanel";
import JiraPanel from "./JiraPanel";
import RevealResults from "./RevealResults";
import Button from "../shared/Button";
import { UseRoom } from "@/hooks/useRoom";
import { NO_CARD } from "@/lib/types";
import style from "./RoomSession.module.css";

interface Props {
	room: UseRoom;
}

export default function RoomSession({ room }: Props) {
	const roomId = room.roomId ?? "";
	const revealed = room.revealedVotes !== null;
	const hasTicket = room.currentCard !== NO_CARD;

	return (
		<>
			<AppHeader roomName={room.roomName} onLeave={room.leave} />
			<main className={`container ${style.main}`}>
				<div className={style.workspace}>
					<section className={style.board}>
						<header className={style.boardHead}>
							<div className={style.heading}>
								<span className={style.label}>{revealed ? "Results" : "Now estimating"}</span>
								<h2 className={style.task}>{hasTicket ? room.currentCard : "Waiting for a ticket"}</h2>
							</div>
							<div className={style.actions}>
								{!revealed && room.selectedVote !== null && room.votingOpen && (
									<span className={style.your}>
										Your vote
										<strong>{room.selectedVote}</strong>
									</span>
								)}
								{room.isOwner &&
									(revealed ? (
										<Button variant="ghost" onClick={() => room.setCard(room.currentCard)}>
											<RotateCcw size={16} />
											Vote again
										</Button>
									) : (
										<Button onClick={room.reveal} disabled={!room.votingOpen}>
											<Eye size={16} />
											Reveal estimates
										</Button>
									))}
							</div>
						</header>

						{revealed && room.revealedVotes ? (
							<RevealResults votes={room.revealedVotes} displayNameFor={room.displayNameFor} />
						) : (
							<VotingCards
								showHeader={false}
								cards={room.cards}
								selectedVote={room.selectedVote}
								votingOpen={room.votingOpen}
								currentCard={room.currentCard}
								onVote={room.vote}
							/>
						)}
					</section>

					{room.isOwner && (
						<>
							<div className={style.divider} />
							<section className={style.section}>
								<TicketPanel onSetCard={room.setCard} />
							</section>
							<div className={style.divider} />
							<section className={style.section}>
								<JiraPanel
									roomId={roomId}
									tickets={room.jiraTickets}
									onFetch={room.fetchJira}
									onSetCard={room.setCard}
								/>
							</section>
						</>
					)}
				</div>

				<aside className={style.sidebar}>
					<section className={style.invite}>
						<span className={style.inviteLabel}>Invite your team</span>
						<RoomShare roomId={roomId} />
					</section>
					<div className={style.divider} />
					<ParticipantList
						participants={room.participants}
						votedUserIds={room.votedUserIds}
						votingOpen={room.votingOpen}
					/>
				</aside>
			</main>
		</>
	);
}
