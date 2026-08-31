import { useEffect, useState } from "react";

const NAV_ITEMS = [
	{ label: "ABOUT", href: "#about" },
	{ label: "EXP.", href: "#experience" },
	{ label: "PROJECTS", href: "#projects" },
	{ label: "CONTACT", href: "#contact" },
];

const CONTRAST_KEY = "high-contrast";

export function Banner() {
	const [contrast, setContrast] = useState(false);

	useEffect(() => {
		try {
			setContrast(localStorage.getItem(CONTRAST_KEY) === "true");
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
		<header className="sticky top-0 z-10 bg-black/10 backdrop-blur-sm">
			<div className="container-main flex items-center justify-between py-4">
				<a href="#top" className="wordmark font-myfont" aria-label="home">
					TRISTEN
					<span className="block">KURUTZ</span>
				</a>
				<nav className="flex items-center gap-8" aria-label="main navigation">
					{NAV_ITEMS.map((item) => (
						<a key={item.href} href={item.href} className="nav-btn">
							{item.label}
						</a>
					))}
					<label className="flex cursor-pointer select-none items-center gap-1.5 text-xs tracking-widest text-white/60 transition-colors hover:text-white">
						<input
							type="checkbox"
							id="contrast"
							checked={contrast}
							onChange={(e) => setContrast(e.target.checked)}
							className="h-[0.85em] w-[0.85em] cursor-pointer accent-white"
						/>
						CONTRAST
					</label>
				</nav>
			</div>
		</header>
	);
}
