import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { GachaCard } from "#/data/cards";
import { GachaCardFace } from "./GachaCard";

const VISIBLE_SLOTS = 5;

/**
 * A hand of overlapping cards. Moving the mouse across the fan sweeps
 * through the deck — the card under the pointer lifts to the front.
 * When the pointer is away the fan deals itself one card at a time.
 */
export function CardFan({ cards }: { cards: GachaCard[] }) {
	const ref = useRef<HTMLDivElement>(null);
	const [head, setHead] = useState(0);
	const [hovering, setHovering] = useState(false);

	useEffect(() => {
		if (hovering) return;
		const timer = window.setInterval(() => {
			setHead((value) => (value + 1) % cards.length);
		}, 2600);
		return () => clearInterval(timer);
	}, [hovering, cards.length]);

	const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
		const rect = ref.current?.getBoundingClientRect();
		if (!rect) return;
		const frac = (event.clientX - rect.left) / rect.width;
		setHead(
			Math.min(cards.length - 1, Math.max(0, Math.floor(frac * cards.length))),
		);
		setHovering(true);
	};

	const total = cards.length;

	return (
		<div className="fan-wrap">
			<div
				className="fan"
				ref={ref}
				onPointerMove={onMove}
				onPointerLeave={() => setHovering(false)}
			>
				{cards.map((card, index) => {
					let offset = index - head;
					if (offset > total / 2) offset -= total;
					if (offset < -total / 2) offset += total;
					const distance = Math.abs(offset);
					if (distance > VISIBLE_SLOTS / 2) return null;
					const isFront = offset === 0;
					return (
						<div
							key={card.id}
							className={`fan-card ${isFront ? "fan-card-front" : ""}`}
							style={{
								transform: `translateX(${offset * 56}px) translateY(${distance * 9}px) rotate(${offset * 5}deg) scale(${1 - distance * 0.05})`,
								zIndex: 20 - distance,
								filter: isFront
									? "none"
									: `brightness(${0.8 - distance * 0.08})`,
							}}
						>
							<Link
								to="/collection"
								search={{ card: card.id }}
								className="fan-link"
								aria-label={`View ${card.name}`}
							>
								<GachaCardFace card={card} state="reveal" />
							</Link>
						</div>
					);
				})}
			</div>
			<div className="fan-hint dim">
				{hovering
					? "sweep to browse — click the front card to inspect"
					: "hover the fan to browse the deck"}
			</div>
		</div>
	);
}
