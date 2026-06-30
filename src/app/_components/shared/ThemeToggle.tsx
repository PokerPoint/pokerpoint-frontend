"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import style from "./ThemeToggle.module.css";

export default function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	const isDark = resolvedTheme === "dark";

	return (
		<button
			type="button"
			className={style.toggle}
			aria-label="Toggle colour theme"
			onClick={() => setTheme(isDark ? "light" : "dark")}
		>
			{mounted ? isDark ? <Sun size={18} /> : <Moon size={18} /> : <span className={style.placeholder} />}
		</button>
	);
}
