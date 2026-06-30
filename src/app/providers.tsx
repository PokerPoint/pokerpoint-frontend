"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { ToastProvider } from "./_components/shared/Toast";

export default function Providers({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
			<ToastProvider>{children}</ToastProvider>
		</ThemeProvider>
	);
}
