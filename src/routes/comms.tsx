import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/comms")({ component: CommsPage });

const EMAIL = "tristenkurutz@gmail.com";

const CHANNELS = [
	{
		id: "linkedin",
		label: "LINKEDIN",
		value: "tristen-kurutz",
		href: "https://www.linkedin.com/in/tristen-kurutz",
	},
	{
		id: "github",
		label: "GITHUB",
		value: "tristenkurutz",
		href: "https://github.com/tristenkurutz",
	},
];

function CommsPage() {
	const [copied, setCopied] = useState(false);
	const timerRef = useRef<number | undefined>(undefined);

	useEffect(() => () => clearTimeout(timerRef.current), []);

	const copyEmail = async () => {
		try {
			await navigator.clipboard.writeText(EMAIL);
			setCopied(true);
			clearTimeout(timerRef.current);
			timerRef.current = window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// clipboard blocked; the mailto link still works
		}
	};

	return (
		<div className="comms-page">
			<h1 className="page-title font-myfont">COMMS</h1>
			<p className="section-sub">
				&gt;_ UPLINK ESTABLISHED. TRANSMISSION CHANNELS BELOW.
			</p>

			<div className="status-banner">
				<span className="status-dot" aria-hidden="true" />
				STATUS: OPEN TO FULL-TIME ROLES — GRADUATING DEC 2026
			</div>

			<div className="comms-list">
				<div className="comms-row">
					<span className="comms-label">EMAIL</span>
					<a href={`mailto:${EMAIL}`} className="comms-value neon-link">
						{EMAIL}
					</a>
					<button type="button" className="copy-btn" onClick={copyEmail}>
						{copied ? "COPIED ✓" : "COPY"}
					</button>
				</div>
				{CHANNELS.map((channel) => (
					<div key={channel.id} className="comms-row">
						<span className="comms-label">{channel.label}</span>
						<a
							href={channel.href}
							target="_blank"
							rel="noopener noreferrer"
							className="comms-value neon-link"
						>
							{channel.value} ↗
						</a>
					</div>
				))}
				<div className="comms-row">
					<span className="comms-label">RESUME</span>
					<a
						href="/resume.pdf"
						target="_blank"
						rel="noopener noreferrer"
						className="comms-value neon-link"
					>
						PDF ↗
					</a>
				</div>
			</div>

			<p className="section-sub comms-foot">
				Response time: usually faster than a 90-pull pity.
			</p>
		</div>
	);
}
