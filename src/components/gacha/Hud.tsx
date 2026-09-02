import { SignInButton, UserButton } from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ContrastToggle } from "#/components/ContrastToggle";
import { Modal } from "#/components/gacha/Modal";
import { useClaimStipend, useGachaSession } from "#/hooks/useGacha";
import { STIPEND_AMOUNT } from "#/lib/gacha";
import { sfx } from "#/lib/sfx";

const NAV_ITEMS = [
	{ label: "SUMMON", to: "/" },
	{ label: "INVENTORY", to: "/collection" },
	{ label: "DOSSIER", to: "/about" },
	{ label: "COMMS", to: "/comms" },
] as const;

const CONTRAST_KEY = "high-contrast";
const GOLD_KEY = "gold-mode";
const GOLD_UNLOCK_AT = 15;

export function Hud() {
	const { status, state } = useGachaSession();
	const claimStipend = useClaimStipend();
	const [stipendReady, setStipendReady] = useState(false);
	const [contrast, setContrast] = useState(false);
	const [muted, setMuted] = useState(false);
	const [creditsInfoOpen, setCreditsInfoOpen] = useState(false);
	const [goldMode, setGoldMode] = useState(false);

	const goldUnlocked =
		status === "ready" && Object.keys(state.owned).length >= GOLD_UNLOCK_AT;

	useEffect(() => {
		try {
			setGoldMode(localStorage.getItem(GOLD_KEY) === "true");
		} catch {
			// ignore
		}
	}, []);

	useEffect(() => {
		const active = goldMode && goldUnlocked;
		document.documentElement.classList.toggle("gold-mode", active);
		try {
			localStorage.setItem(GOLD_KEY, String(active));
		} catch {
			// ignore
		}
	}, [goldMode, goldUnlocked]);

	useEffect(() => {
		setStipendReady(
			status === "ready" &&
				state.lastStipendDate !== new Date().toISOString().slice(0, 10),
		);
	}, [status, state.lastStipendDate]);

	useEffect(() => {
		setMuted(sfx.isMuted());
	}, []);

	useEffect(() => {
		try {
			const stored = localStorage.getItem(CONTRAST_KEY);
			if (stored !== null) {
				setContrast(stored === "true");
			} else if (window.matchMedia("(prefers-contrast: more)").matches) {
				setContrast(true);
			}
		} catch {
			// storage can be blocked; the toggle still works for the session
		}
	}, []);

	useEffect(() => {
		document.documentElement.classList.toggle("high-contrast", contrast);
		try {
			localStorage.setItem(CONTRAST_KEY, String(contrast));
		} catch {
			// ignore
		}
	}, [contrast]);

	return (
		<header className="hud">
			<div className="hud-inner">
				<Link to="/" className="wordmark font-myfont" aria-label="home">
					TRISTEN
					<span className="wordmark-sub">KURUTZ</span>
				</Link>
				<nav className="hud-nav" aria-label="main navigation">
					{NAV_ITEMS.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							className="nav-btn"
							activeProps={{ "data-active": true }}
						>
							{item.label}
						</Link>
					))}
				</nav>
				<div className="hud-right">
					{status === "ready" && state.streak > 0 && (
						<span className="streak-chip" title="Daily uplink streak">
							STREAK ×{state.streak}
						</span>
					)}
					{status === "ready" && stipendReady && (
						<button
							type="button"
							className="stipend-btn"
							onClick={() => claimStipend()}
						>
							UPLINK +{STIPEND_AMOUNT}◈
						</button>
					)}
					<button
						type="button"
						className="credits-chip"
						onClick={() => setCreditsInfoOpen(true)}
						aria-label="Credit balance — how to earn credits"
					>
						<span aria-hidden="true">◈</span>{" "}
						{status === "ready" ? state.credits : "…"}
					</button>
					<button
						type="button"
						className="mute-btn"
						onClick={() => setMuted(sfx.toggleMute())}
						aria-pressed={muted}
						aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
					>
						{muted ? "🔇" : "🔊"}
					</button>
					<button
						type="button"
						className={`gold-btn ${goldMode && goldUnlocked ? "gold-btn-on" : ""}`}
						disabled={!goldUnlocked}
						title={
							goldUnlocked
								? "Toggle gold mode"
								: `Unlocks at ${GOLD_UNLOCK_AT} decrypted records`
						}
						onClick={() => setGoldMode((value) => !value)}
						aria-pressed={goldMode && goldUnlocked}
					>
						✦
					</button>
					<ContrastToggle checked={contrast} onCheckedChange={setContrast} />
					{status === "signed-out" ? (
						<SignInButton mode="modal">
							<button type="button" className="sign-in-btn">
								SIGN IN
							</button>
						</SignInButton>
					) : (
						<UserButton />
					)}
				</div>
			</div>

			<Modal
				open={creditsInfoOpen}
				onClose={() => setCreditsInfoOpen(false)}
				label="How to earn credits"
			>
				<h3 className="modal-title">CREDITS ◈</h3>
				<p className="modal-sub">
					Credits live on your account — they follow you across devices. They
					are earned, not given:
				</p>
				<ul className="credits-info-list">
					<li>
						<span>FIRST TRANSMISSION</span>
						<span className="lit">+900◈ once — send a message via COMMS</span>
					</li>
					<li>
						<span>CREDIT MINER</span>
						<span className="lit">+1◈/click, 150◈ daily cap</span>
					</li>
					<li>
						<span>DAILY UPLINK</span>
						<span className="lit">+100◈ / day</span>
					</li>
					<li>
						<span>DUPLICATE CARDS</span>
						<span className="lit">+20◈ → +500◈ by rarity</span>
					</li>
					<li>
						<span>TROPHIES</span>
						<span className="lit">+25◈ → +300◈ (see DOSSIER)</span>
					</li>
				</ul>
				<p className="modal-foot">
					New operators start at 0◈ but the first summon is free and always
					decrypts the operator card. Pity: SR+ every 10 pulls · UR at 90. No
					refunds on pulls.
				</p>
			</Modal>
		</header>
	);
}
