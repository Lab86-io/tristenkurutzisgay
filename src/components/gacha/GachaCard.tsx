import {
	type GachaCard,
	RARITY_LEVEL,
	RARITY_META,
	type Rarity,
} from "#/data/cards";

const TYPE_ICON = {
	CHARACTER: "🧑‍💻",
	ROLE: "💼",
	PROJECT: "📁",
	SKILL: "⚡",
} as const;

/**
 * Animated rarity orbs — glowing pips that pulse in sequence.
 * Level = rarity (C=1 … UR=5), color comes from the --rc custom property
 * set by the nearest [data-rarity] ancestor.
 */
export function RarityOrbs({
	rarity,
	size = 8,
}: {
	rarity: Rarity;
	size?: number;
}) {
	const level = RARITY_LEVEL[rarity];
	return (
		<span className={`orb-row orb-${rarity}`} aria-hidden="true">
			{Array.from({ length: level }, (_, index) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: static decorative pips, never reordered
					key={`${rarity}-${index}`}
					className="orb"
					style={{
						width: size,
						height: size,
						animationDelay: `${index * 0.4}s`,
					}}
				/>
			))}
			<span className="orb-label">{RARITY_META[rarity].label}</span>
		</span>
	);
}

export function TypeIcon({
	type,
	size = 12,
}: {
	type: GachaCard["type"];
	size?: number;
}) {
	return (
		<span className="type-row">
			<span className="type-icon" style={{ fontSize: size }} aria-hidden="true">
				{TYPE_ICON[type]}
			</span>
			{type}
		</span>
	);
}

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
				{locked ? (
					<span className="orb-row orb-locked" aria-hidden="true">
						<span className="orb" style={{ width: 8, height: 8 }} />
					</span>
				) : (
					<RarityOrbs rarity={card.rarity} />
				)}
				<TypeIcon type={card.type} />
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

export function CardBack({ tell }: { tell?: "SSR" | "UR" }) {
	return (
		<div className="gcard gcard-back" data-tell={tell} aria-hidden="true">
			<div className="gcard-top">
				<span className="orb-row orb-locked" aria-hidden="true">
					<span className="orb" style={{ width: 8, height: 8 }} />
				</span>
				<span className="type-row">
					<span
						className="type-icon"
						style={{ fontSize: 12 }}
						aria-hidden="true"
					>
						❔
					</span>
					DATA
				</span>
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
