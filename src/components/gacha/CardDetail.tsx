import type { GachaCard } from "#/data/cards";
import { RarityOrbs } from "./GachaCard";

export function StatBars({
	stats,
}: {
	stats: NonNullable<GachaCard["stats"]>;
}) {
	return (
		<div className="stat-bars">
			{stats.map((stat) => (
				<div key={stat.label} className="stat-row">
					<span className="stat-label">{stat.label}</span>
					<span className="stat-track">
						<span className="stat-fill" style={{ width: `${stat.value}%` }} />
					</span>
					<span className="stat-value">{stat.value}</span>
				</div>
			))}
		</div>
	);
}

export function CardDetail({
	card,
	count,
	firstAcquired,
}: {
	card: GachaCard;
	count?: number;
	firstAcquired?: number;
}) {
	return (
		<div className="card-detail" data-rarity={card.rarity}>
			<header className="card-detail-head">
				<RarityOrbs rarity={card.rarity} size={10} />
			</header>
			<h3 className="card-detail-name">{card.name}</h3>
			<p className="card-detail-tagline">{card.tagline}</p>
			<p className="card-detail-desc">{card.description}</p>
			{card.stats && <StatBars stats={card.stats} />}
			{card.details && card.details.length > 0 && (
				<ul className="card-detail-bullets">
					{card.details.map((detail) => (
						<li key={detail}>{detail}</li>
					))}
				</ul>
			)}
			<div className="card-detail-tags">
				{card.tags.map((tag) => (
					<span key={tag} className="tag-chip">
						{tag}
					</span>
				))}
			</div>
			{card.links && card.links.length > 0 && (
				<div className="card-detail-links">
					{card.links.map((link) => (
						<a
							key={link.href}
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							className="neon-link"
						>
							{link.label}
						</a>
					))}
				</div>
			)}
			{card.note && <p className="card-detail-note">{card.note}</p>}
			{count !== undefined && (
				<p className="card-detail-foot">
					{count > 1 ? `ACQUIRED ×${count}` : "NEW ACQUISITION"}
					{firstAcquired !== undefined &&
						` — ${new Date(firstAcquired).toLocaleDateString()}`}
				</p>
			)}
		</div>
	);
}
