import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ContrastToggle } from "#/components/ContrastToggle";
import { claimStipend, useGacha } from "#/hooks/useGacha";

const NAV_ITEMS = [
	{ label: "SUMMON", to: "/" },
	{ label: "DATABASE", to: "/collection" },
	{ label: "DOSSIER", to: "/about" },
	{ label: "COMMS", to: "/comms" },
] as const;

const CONTRAST_KEY = "high-contrast";

export function Hud() {
	const state = useGacha();
	const [stipendReady, setStipendReady] = useState(false);
	const [contrast, setContrast] = useState(false);

	useEffect(() => {
		setStipendReady(
			state.stipendDate !== new Date().toISOString().slice(0, 10),
		);
	}, [state.stipendDate]);

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
					{stipendReady && (
						<button
							type="button"
							className="stipend-btn"
							onClick={() => claimStipend()}
						>
							UPLINK +600◈
						</button>
					)}
					<span className="credits-chip">
						<span aria-hidden="true">◈</span> {state.credits}
					</span>
					<ContrastToggle checked={contrast} onCheckedChange={setContrast} />
				</div>
			</div>
		</header>
	);
}
