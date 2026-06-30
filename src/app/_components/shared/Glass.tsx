import { ComponentPropsWithoutRef } from "react";
import style from "./Glass.module.css";

export default function Glass({ className, children, ...rest }: ComponentPropsWithoutRef<"div">) {
	return (
		<div className={[style.glass, className].filter(Boolean).join(" ")} {...rest}>
			{children}
		</div>
	);
}
