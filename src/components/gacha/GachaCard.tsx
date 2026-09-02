import type { GachaCard } from "#/data/cards";

const TYPE_GLYPH: Record<GachaCard["type"], string> = {
	CHARACTER: "✦",
	ROLE: "◈",
	PROJECT: "▣",
	SKILL: "⬡",
};

export function GachaCardFace({
	card,
	state,
	count,
}: {
	card: GachaCard;
	state: "owned" | "locked" | "reveal";
	count?: number;
}) {
	const locked = state === "locked";
	return (
		<div
			className={`gcard gcard-${state}`}
			data-rarity={card.rarity}
			data-type={card.type}
		>
			{card.rarity === "UR" && (
				<span className="gcard-beam" aria-hidden="true" />
			)}
			<div className="gcard-top">
				<span className="gcard-rarity">{card.rarity}</span>
				<span className="gcard-type" aria-hidden="true">
					{TYPE_GLYPH[card.type]} {card.type}
				</span>
			</div>
			<div className="gcard-body">
				{locked ? (
					<span className="gcard-unknown" aria-hidden="true">
						?
					</span>
				) : (
					<>
						<h3 className="gcard-name">{card.name}</h3>
						<p className="gcard-tagline">{card.tagline}</p>
					</>
				)}
			</div>
			<div className="gcard-bottom">
				{locked ? (
					<span className="gcard-locked-label">ENCRYPTED</span>
				) : (
					<>
						<span className="gcard-tags">
							{card.tags.slice(0, 3).join(" · ")}
						</span>
						{count !== undefined && count > 1 && (
							<span className="gcard-count">×{count}</span>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export function CardBack() {
	return (
		<div className="gcard gcard-back" aria-hidden="true">
			<div className="gcard-top">
				<span className="gcard-rarity">??</span>
				<span className="gcard-type">⬢ DATA</span>
			</div>
			<div className="gcard-body">
				<span className="gcard-mono-mark">TK</span>
			</div>
			<div className="gcard-bottom">
				<span className="gcard-locked-label">DECRYPTING…</span>
			</div>
		</div>
	);
}
