import style from "./Spinner.module.css";

interface Props {
	label?: string;
}

export default function Spinner({ label }: Props) {
	return (
		<span className={style.wrap} role="status">
			<span className={style.spinner} />
			{label && <span className={style.label}>{label}</span>}
		</span>
	);
}
