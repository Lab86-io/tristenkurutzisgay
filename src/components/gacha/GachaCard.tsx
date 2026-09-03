import {
	type GachaCard,
	RARITY_LEVEL,
	RARITY_META,
	type Rarity,
} from "#/data/cards";

const TYPE_LABEL: Record<GachaCard["type"], string> = {
	CHARACTER: "Operator",
	ROLE: "Role",
	PROJECT: "Project",
	SKILL: "Skill",
};

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

export function TypeMarker({ type }: { type: GachaCard["type"] }) {
	return (
		<span className="type-row">
			<span
				className={`type-marker type-marker-${type.toLowerCase()}`}
				aria-hidden="true"
			/>
			{TYPE_LABEL[type]}
		</span>
	);
}

function monogram(name: string): string {
	const words = name
		.replace(/[^\w&.+\s-]/g, " ")
		.split(/\s+/)
		.filter(Boolean);
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
	return words
		.slice(0, 2)
		.map((word) => word[0])
		.join("")
		.toUpperCase();
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
					<RarityOrbs rarity={card.rarity} size={8} />
				)}
				<TypeMarker type={card.type} />
			</div>
			<div className="gcard-art" aria-hidden="true">
				<span className="gcard-art-scan" />
				<span className="gcard-art-mono">
					{locked ? "?" : monogram(card.name)}
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
					<span className="gcard-locked-label">Encrypted</span>
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
				<TypeMarker type="SKILL" />
			</div>
			<div className="gcard-art">
				<span className="gcard-art-scan" />
				<span className="gcard-art-mono">TK</span>
			</div>
			<div className="gcard-bottom">
				<span className="gcard-locked-label">Decrypting…</span>
			</div>
		</div>
	);
}
