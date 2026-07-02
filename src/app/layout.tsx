import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ReactNode } from "react";
import { site } from "@/lib/config";
import Analytics from "./_components/shared/Analytics";
import ConsentBanner from "./_components/shared/ConsentBanner";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const display = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-display",
	display: "swap",
});

const mono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL(site.url),
	title: {
		default: site.title,
		template: "%s | PokerPoint",
	},
	description: site.description,
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/favicon.ico",
	},
	openGraph: {
		type: "website",
		siteName: site.name,
		title: site.title,
		description: site.description,
	},
	twitter: {
		card: "summary_large_image",
		title: site.title,
		description: site.description,
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={`${inter.variable} ${display.variable} ${mono.variable}`}
			suppressHydrationWarning
		>
			<body>
				<Providers>{children}</Providers>
				<ConsentBanner />
				<Analytics />
			</body>
		</html>
	);
}
