import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { GachaCard } from "#/data/cards";
import { GachaCardFace } from "./GachaCard";

const VISIBLE_SLOTS = 5;
/** cards per second when idle */
const BASE_DRIFT = 0.35;
/** max cards per second when the pointer rides an edge */
const MAX_SWEEP = 2.4;

/**
 * A hand of overlapping cards on a slow conveyor.
 * The pointer steers it: ride the left edge and the strip deals left,
 * ride the right edge and it deals right, sit in the middle and it
 * slows to a crawl. The card nearest the middle is the live one.
 */
export function CardFan({ cards }: { cards: GachaCard[] }) {
	const ref = useRef<HTMLDivElement>(null);
	const headRef = useRef(0);
	const velocityRef = useRef(BASE_DRIFT);
	const lastTickRef = useRef<number | undefined>(undefined);
	const [renderHead, setRenderHead] = useState(0);

	const total = cards.length;

	useEffect(() => {
		let raf = 0;
		const tick = (now: number) => {
			const dt = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0;
			lastTickRef.current = now;
			if (total > 0) {
				headRef.current =
					(headRef.current + velocityRef.current * dt + total) % total;
				setRenderHead(headRef.current);
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [total]);

	const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
		const rect = ref.current?.getBoundingClientRect();
		if (!rect || rect.width === 0) return;
		const frac = (event.clientX - rect.left) / rect.width;
		// left edge → deal left (positive), right edge → deal right (negative),
		// middle → crawl
		velocityRef.current = (0.5 - frac) * 2 * MAX_SWEEP;
	};

	const stop = () => {
		velocityRef.current = BASE_DRIFT;
	};

	return (
		<div className="fan-wrap">
			<div
				className="fan"
				ref={ref}
				onPointerMove={onMove}
				onPointerLeave={stop}
			>
				{cards.map((card, index) => {
					let offset = index - renderHead;
					// wrap into (-total/2, total/2]
					offset = ((offset % total) + total) % total;
					if (offset > total / 2) offset -= total;
					const distance = Math.abs(offset);
					if (distance > VISIBLE_SLOTS / 2) return null;
					const isFront = distance < 0.5;
					return (
						<div
							key={card.id}
							className={`fan-card ${isFront ? "fan-card-front" : ""}`}
							style={{
								transform: `translateX(${offset * 56}px) translateY(${distance * 9}px) rotate(${offset * 5}deg) scale(${1 - distance * 0.05})`,
								zIndex: 20 - Math.round(distance * 10),
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
				ride the edges to deal through the deck — the middle slows it down
			</div>
		</div>
	);
}
