import { Link } from "@tanstack/react-router";
import { type CSSProperties, useEffect, useState } from "react";
import type { GachaCard } from "#/data/cards";
import { GachaCardFace } from "./GachaCard";

type Deal = { id: string; direction: number; phase: "out" | "in" };

/** Move the front card clear of the hand before changing its stacking order. */
export function CardFan({ cards }: { cards: GachaCard[] }) {
	const [activeId, setActiveId] = useState(cards[0]?.id);
	const [deal, setDeal] = useState<Deal | null>(null);
	const [paused, setPaused] = useState(false);
	const [hovered, setHovered] = useState(false);
	const [focused, setFocused] = useState(false);
	const [reducedMotion, setReducedMotion] = useState(true);
	const total = cards.length;
	const current = Math.max(
		0,
		cards.findIndex((card) => card.id === activeId),
	);
	const currentId = cards[current]?.id;

	useEffect(() => {
		if (deal && !cards.some((card) => card.id === deal.id)) setDeal(null);
	}, [cards, deal]);

	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const sync = () => {
			setReducedMotion(query.matches);
			if (query.matches) setDeal(null);
		};
		sync();
		query.addEventListener("change", sync);
		return () => query.removeEventListener("change", sync);
	}, []);

	useEffect(() => {
		if (
			!currentId ||
			total < 2 ||
			deal ||
			paused ||
			hovered ||
			focused ||
			reducedMotion
		)
			return;
		const timer = window.setInterval(() => {
			if (!document.hidden) {
				setDeal({ id: currentId, direction: 1, phase: "out" });
			}
		}, 4000);
		return () => window.clearInterval(timer);
	}, [currentId, total, deal, paused, hovered, focused, reducedMotion]);

	const advance = (direction: number) => {
		if (!currentId || deal || total < 2) return;
		if (reducedMotion) {
			setActiveId(cards[(current + direction + total) % total].id);
		} else {
			setDeal({ id: currentId, direction, phase: "out" });
		}
	};

	if (!total) return null;

	return (
		<section
			className="fan-wrap"
			aria-label="Featured cards"
			onPointerEnter={(event) => {
				if (event.pointerType === "mouse") setHovered(true);
			}}
			onPointerLeave={() => setHovered(false)}
			onFocusCapture={() => setFocused(true)}
			onBlurCapture={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget))
					setFocused(false);
			}}
		>
			<div className="fan">
				{cards.map((card, index) => {
					let offset = (index - current + total) % total;
					if (offset > total / 2) offset -= total;
					const distance = Math.abs(offset);
					if (distance > 2) return null;
					const isFront = index === current;
					const moving = deal?.id === card.id;
					return (
						<div
							key={card.id}
							className={`fan-card ${isFront ? "fan-card-front" : ""} ${moving ? `fan-card-deal-${deal.phase}` : ""}`}
							aria-hidden={!isFront}
							style={
								{
									"--fan-offset": offset,
									"--fan-y": `${distance * 9}px`,
									"--fan-rotation": `${offset * 5}deg`,
									"--fan-scale": 1 - distance * 0.05,
									"--deal-direction": deal ? -deal.direction : -1,
									zIndex: 10 - distance,
								} as CSSProperties
							}
							onAnimationEnd={(event) => {
								if (event.target !== event.currentTarget || !moving) return;
								if (deal.phase === "out") {
									setActiveId(
										cards[(current + deal.direction + total) % total].id,
									);
									setDeal({ ...deal, phase: "in" });
								} else {
									setDeal(null);
								}
							}}
						>
							<Link
								to="/collection"
								search={{ card: card.id }}
								className="fan-link"
								tabIndex={isFront ? 0 : -1}
								aria-label={`Find ${card.name} in inventory`}
							>
								<GachaCardFace card={card} state="reveal" />
							</Link>
						</div>
					);
				})}
			</div>
			{total > 1 && (
				<div className="fan-controls">
					<button
						type="button"
						className="fan-control"
						aria-label="Previous featured card"
						disabled={Boolean(deal)}
						onClick={() => advance(-1)}
					>
						←
					</button>
					<span className="fan-count">
						{current + 1} / {total}
					</span>
					{!reducedMotion && (
						<button
							type="button"
							className="fan-control fan-pause"
							aria-label={
								paused ? "Resume card rotation" : "Pause card rotation"
							}
							aria-pressed={paused}
							onClick={() => setPaused(!paused)}
						>
							{paused ? "Play" : "Pause"}
						</button>
					)}
					<button
						type="button"
						className="fan-control"
						aria-label="Next featured card"
						disabled={Boolean(deal)}
						onClick={() => advance(1)}
					>
						→
					</button>
				</div>
			)}
		</section>
	);
}
