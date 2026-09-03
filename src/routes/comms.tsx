import { SignInButton } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useCards } from "#/hooks/useCards";
import { useGachaSession, useSendMessage } from "#/hooks/useGacha";
import { CONTACT_REWARD } from "#/lib/gacha";

export const Route = createFileRoute("/comms")({
	head: () => ({
		meta: [{ title: "Comms — Tristen Kurutz" }],
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
		label: "Email",
		value: EMAIL,
		href: `mailto:${EMAIL}`,
		external: false,
		required: 5,
	},
	{
		id: "linkedin",
		label: "LinkedIn",
		value: "tristen-kurutz",
		href: "https://www.linkedin.com/in/tristen-kurutz",
		external: true,
		required: 10,
	},
	{
		id: "github",
		label: "GitHub",
		value: "tristenkurutz",
		href: "https://github.com/tristenkurutz",
		external: true,
		required: 15,
	},
];

function CommsPage() {
	const { status, state } = useGachaSession();
	const { cards } = useCards();
	const sendMessage = useSendMessage();
	const [copied, setCopied] = useState(false);
	const [form, setForm] = useState({ name: "", email: "", message: "" });
	const [sending, setSending] = useState(false);
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

	const submitMessage = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (sending) return;
		setSending(true);
		const ok = await sendMessage(form.name, form.email, form.message);
		setSending(false);
		if (ok) setForm({ name: "", email: "", message: "" });
	};

	const uniqueOwned = Object.keys(state.owned).length;
	const roleCards = cards.filter((card) => card.type === "ROLE");
	const rolesOwned = roleCards.every((card) => state.owned[card.id]);
	const resumeUnlocked = rolesOwned;

	return (
		<div className="comms-page">
			<h1 className="page-title font-myfont">Comms</h1>
			<p className="section-sub">
				Contact channels are earned here — decrypt records to open them.
			</p>

			<div className="status-banner">
				<span className="status-dot" aria-hidden="true" />
				Open to full-time roles — graduating Dec 2026
			</div>

			{status === "ready" ? (
				<section className="panel transmit-panel">
					<h2 className="panel-title">
						{state.contactRewarded
							? "Send a transmission"
							: `FIRST TRANSMISSION — +${CONTACT_REWARD}◈`}
					</h2>
					<p className="transmit-sub">
						{state.contactRewarded
							? "The reward is claimed, but messages still get through."
							: `One-time bonus: send Tristen a message (10+ characters) and the ledger pays out +${CONTACT_REWARD}◈ — enough for a 10-pull.`}
					</p>
					<form className="transmit-form" onSubmit={submitMessage}>
						<div className="transmit-row">
							<label className="transmit-label" htmlFor="tx-name">
								NAME
							</label>
							<input
								id="tx-name"
								className="transmit-input"
								value={form.name}
								maxLength={80}
								required
								onChange={(event) =>
									setForm({ ...form, name: event.target.value })
								}
							/>
						</div>
						<div className="transmit-row">
							<label className="transmit-label" htmlFor="tx-email">
								EMAIL
							</label>
							<input
								id="tx-email"
								className="transmit-input"
								type="email"
								value={form.email}
								maxLength={120}
								required
								onChange={(event) =>
									setForm({ ...form, email: event.target.value })
								}
							/>
						</div>
						<div className="transmit-row">
							<label className="transmit-label" htmlFor="tx-message">
								MESSAGE
							</label>
							<textarea
								id="tx-message"
								className="transmit-input transmit-textarea"
								value={form.message}
								maxLength={2000}
								minLength={10}
								required
								rows={4}
								placeholder="Introduce yourself, ask about roles, trade Rimworld tips…"
								onChange={(event) =>
									setForm({ ...form, message: event.target.value })
								}
							/>
						</div>
						<button
							type="submit"
							className="btn btn-neon"
							disabled={
								sending ||
								!form.name.trim() ||
								!form.email.includes("@") ||
								form.message.trim().length < 10
							}
						>
							{sending
								? "Transmitting…"
								: `Transmit${state.contactRewarded ? "" : ` — +${CONTACT_REWARD}◈`}`}
						</button>
					</form>
				</section>
			) : (
				<section className="panel transmit-panel">
					<h2 className="panel-title">
						FIRST TRANSMISSION — +{CONTACT_REWARD}◈
					</h2>
					<p className="transmit-sub">
						{status === "signed-out" ? (
							<>
								<SignInButton mode="modal">
									<button type="button" className="linklike neon-link">
										SIGN IN
									</button>
								</SignInButton>{" "}
								to send the first transmission and claim the opening bonus — it
								is worth a full 10-pull.
							</>
						) : (
							"CONNECTING…"
						)}
					</p>
				</section>
			)}

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
