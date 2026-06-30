"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "@/lib/config";
import { RevealedVote } from "@/lib/types";
import style from "./RevealResults.module.css";

interface Props {
	votes: RevealedVote[];
	displayNameFor: (userId: string) => string;
}

export default function RevealResults({ votes, displayNameFor }: Props) {
	const summary = useMemo(() => {
		const counts: Record<string, number> = {};
		const groups: Record<string, string[]> = {};
		const numeric: number[] = [];

		votes.forEach(({ vote, userId }) => {
			const name = displayNameFor(userId);
			if (!name) return;
			counts[vote] = (counts[vote] ?? 0) + 1;
			groups[vote] = groups[vote] ?? [];
			groups[vote].push(name);
			const asNumber = Number(vote);
			if (!Number.isNaN(asNumber) && vote.trim() !== "") numeric.push(asNumber);
		});

		const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
		const entries = Object.entries(counts);
		const top = entries.reduce<[string, number] | null>(
			(best, current) => (best === null || current[1] > best[1] ? current : best),
			null,
		);
		const average =
			numeric.length > 0 ? numeric.reduce((sum, n) => sum + n, 0) / numeric.length : null;
		const agreement = top && total > 0 ? Math.round((top[1] / total) * 100) : 0;

		return {
			total,
			groups,
			chartData: entries.map(([name, count]) => ({ name, count })),
			consensus: top ? top[0] : "-",
			average,
			agreement,
		};
	}, [votes, displayNameFor]);

	return (
		<div className={style.wrap}>
			<div className={style.stats}>
				<div className={style.stat}>
					<span className={style.statValue}>
						{summary.average !== null ? summary.average.toFixed(1) : "-"}
					</span>
					<span className={style.statLabel}>Average</span>
				</div>
				<div className={style.stat}>
					<span className={style.statValue}>{summary.consensus}</span>
					<span className={style.statLabel}>Most picked</span>
				</div>
				<div className={style.stat}>
					<span className={style.statValue}>{summary.agreement}%</span>
					<span className={style.statLabel}>Agreement</span>
				</div>
			</div>

			<div className={style.chart}>
				<ResponsiveContainer width="100%" height={Math.max(140, summary.chartData.length * 46)}>
					<BarChart
						data={summary.chartData}
						layout="vertical"
						margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
					>
						<XAxis type="number" hide allowDecimals={false} />
						<YAxis
							type="category"
							dataKey="name"
							width={48}
							tickLine={false}
							axisLine={false}
							tick={{ fill: "currentColor", fontWeight: 700 }}
						/>
						<Tooltip
							cursor={{ fill: "rgba(255, 141, 41, 0.14)" }}
							contentStyle={{
								background: "var(--surface)",
								border: "1px solid var(--line-strong)",
								borderRadius: "12px",
								color: "var(--ink)",
							}}
							formatter={(value: number) => [`${value} vote${value === 1 ? "" : "s"}`, "Votes"]}
						/>
						<Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={26}>
							{summary.chartData.map((entry, index) => (
								<Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>

			<div className={style.breakdown}>
				{Object.entries(summary.groups).map(([vote, names]) => (
					<div key={vote} className={style.group}>
						<div className={style.groupHead}>
							<span className={style.groupVote}>{vote}</span>
							<span className={style.groupCount}>
								{names.length} vote{names.length === 1 ? "" : "s"}
							</span>
						</div>
						<div className={style.voters}>
							{names.map((name, index) => (
								<span key={`${vote}-${index}`} className={style.voter}>
									{name}
								</span>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
