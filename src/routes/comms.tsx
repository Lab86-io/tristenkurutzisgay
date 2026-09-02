import { SignInButton } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ALL_CARDS } from "#/data/cards";
import { useGachaSession } from "#/hooks/useGacha";

export const Route = createFileRoute("/comms")({
	head: () => ({
		meta: [{ title: "COMMS — TRISTEN KURUTZ" }],
	}),
	component: CommsPage,
});

const EMAIL = "tristenkurutz@gmail.com";

interface Channel {
	id: string;
	label: string;
	value: string;
	href: string;
	external: boolean;
	/** unique records required to decrypt this channel */
	required: number;
}

const CHANNELS: Channel[] = [
	{
		id: "email",
		label: "EMAIL",
		value: EMAIL,
		href: `mailto:${EMAIL}`,
		external: false,
		required: 5,
	},
	{
		id: "linkedin",
		label: "LINKEDIN",
		value: "tristen-kurutz",
		href: "https://www.linkedin.com/in/tristen-kurutz",
		external: true,
		required: 10,
	},
	{
		id: "github",
		label: "GITHUB",
		value: "tristenkurutz",
		href: "https://github.com/tristenkurutz",
		external: true,
		required: 15,
	},
];

function CommsPage() {
	const { status, state } = useGachaSession();
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
			// clipboard blocked
		}
	};

	const uniqueOwned = Object.keys(state.owned).length;
	const roleCards = ALL_CARDS.filter((card) => card.type === "ROLE");
	const rolesOwned = roleCards.every((card) => state.owned[card.id]);
	const resumeUnlocked = rolesOwned;

	return (
		<div className="comms-page">
			<h1 className="page-title font-myfont">COMMS</h1>
			<p className="section-sub">
				&gt;_ UPLINK CHANNELS ARE EARNED. DECRYPT RECORDS TO OPEN THEM.
			</p>

			<div className="status-banner">
				<span className="status-dot" aria-hidden="true" />
				STATUS: OPEN TO FULL-TIME ROLES — GRADUATING DEC 2026
			</div>

			<div className="comms-list">
				{status !== "ready" && (
					<div className="comms-row comms-locked-row">
						<span className="comms-label">ACCESS</span>
						<span className="comms-locked-text">
							{status === "signed-out" ? (
								<SignInButton mode="modal">
									<button type="button" className="linklike neon-link">
										SIGN IN
									</button>
								</SignInButton>
							) : (
								"CONNECTING…"
							)}{" "}
							to start decrypting. Channels unlock as your inventory grows.
						</span>
					</div>
				)}
				{CHANNELS.map((channel) => {
					const unlocked =
						status === "ready" && uniqueOwned >= channel.required;
					return (
						<div
							key={channel.id}
							className="comms-row"
							data-locked={unlocked ? undefined : true}
						>
							<span className="comms-label">{channel.label}</span>
							{unlocked ? (
								<a
									href={channel.href}
									target={channel.external ? "_blank" : undefined}
									rel={channel.external ? "noopener noreferrer" : undefined}
									className="comms-value neon-link"
								>
									{channel.value}
									{channel.external ? " ↗" : ""}
								</a>
							) : (
								<span className="comms-value comms-locked-value">
									🔒 DECRYPT {channel.required} RECORDS (
									{Math.min(uniqueOwned, channel.required)}/{channel.required})
								</span>
							)}
							{unlocked && channel.id === "email" && (
								<button type="button" className="copy-btn" onClick={copyEmail}>
									{copied ? "COPIED ✓" : "COPY"}
								</button>
							)}
						</div>
					);
				})}
				<div
					className="comms-row"
					data-locked={resumeUnlocked ? undefined : true}
				>
					<span className="comms-label">RESUME</span>
					{resumeUnlocked ? (
						<a
							href="/resume.pdf"
							target="_blank"
							rel="noopener noreferrer"
							className="comms-value neon-link"
						>
							PDF ↗
						</a>
					) : (
						<span className="comms-value comms-locked-value">
							🔒 ACQUIRE EVERY ROLE CARD (
							{roleCards.filter((card) => state.owned[card.id]).length}/
							{roleCards.length}) — see INVENTORY
						</span>
					)}
				</div>
			</div>

			<p className="section-sub comms-foot">
				Response time: usually faster than a 90-pull pity.
			</p>
		</div>
	);
}
