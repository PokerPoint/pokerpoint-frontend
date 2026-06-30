"use client";

import { Eye } from "lucide-react";
import AppHeader from "./AppHeader";
import VotingCards from "./VotingCards";
import ParticipantList from "./ParticipantList";
import RoomShare from "./RoomShare";
import TicketPanel from "./TicketPanel";
import JiraPanel from "./JiraPanel";
import RevealResults from "./RevealResults";
import Glass from "../shared/Glass";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import { UseRoom } from "@/hooks/useRoom";
import style from "./RoomSession.module.css";

interface Props {
	room: UseRoom;
}

export default function RoomSession({ room }: Props) {
	const roomId = room.roomId ?? "";

	return (
		<>
			<AppHeader roomName={room.roomName} onLeave={room.leave} />
			<main className={`container ${style.main}`}>
				<div className={style.primary}>
					<Glass className={style.stage}>
						<VotingCards
							cards={room.cards}
							selectedVote={room.selectedVote}
							votingOpen={room.votingOpen}
							currentCard={room.currentCard}
							onVote={room.vote}
						/>
						{room.isOwner && (
							<div className={style.ownerBar}>
								<Button onClick={room.reveal} disabled={!room.votingOpen}>
									<Eye size={17} />
									Reveal estimates
								</Button>
							</div>
						)}
					</Glass>

					<RoomShare roomId={roomId} />

					{room.isOwner && (
						<Glass className={style.tools}>
							<TicketPanel onSetCard={room.setCard} />
							<div className={style.divider} />
							<JiraPanel
								roomId={roomId}
								tickets={room.jiraTickets}
								onFetch={room.fetchJira}
								onSetCard={room.setCard}
							/>
						</Glass>
					)}
				</div>

				<ParticipantList
					participants={room.participants}
					votedUserIds={room.votedUserIds}
					votingOpen={room.votingOpen}
				/>
			</main>

			<Modal open={room.revealedVotes !== null} onClose={room.closeReveal} title="Results">
				{room.revealedVotes && (
					<RevealResults votes={room.revealedVotes} displayNameFor={room.displayNameFor} />
				)}
			</Modal>
		</>
	);
}
