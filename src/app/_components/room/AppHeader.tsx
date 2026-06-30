import { LogOut } from "lucide-react";
import Logo from "../shared/Logo";
import ThemeToggle from "../shared/ThemeToggle";
import style from "./AppHeader.module.css";

interface Props {
	roomName?: string;
	onLeave?: () => void;
}

export default function AppHeader({ roomName, onLeave }: Props) {
	return (
		<header className={style.header}>
			<div className={`container ${style.inner}`}>
				<Logo />
				{roomName && (
					<span className={style.room} title={roomName}>
						{roomName}
					</span>
				)}
				<div className={style.actions}>
					<ThemeToggle />
					{onLeave && (
						<button type="button" className={style.leave} onClick={onLeave}>
							<LogOut size={16} />
							<span>Leave</span>
						</button>
					)}
				</div>
			</div>
		</header>
	);
}
