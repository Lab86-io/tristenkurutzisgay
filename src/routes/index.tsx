import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GachaCardFace } from "#/components/gacha/GachaCard";
import { PullReveal } from "#/components/gacha/PullReveal";
import { RatesModal } from "#/components/gacha/RatesModal";
import { TypingGreeting } from "#/components/TypingGreeting";
import { ALL_CARDS, CHARACTER_CARD } from "#/data/cards";
import { resetSave, summon, useGacha } from "#/hooks/useGacha";
import type { PullResult } from "#/lib/gacha";
import { PITY_SR, PITY_UR, PULL_COST, TEN_PULL_COST } from "#/lib/gacha";

export const Route = createFileRoute("/")({ component: SummonPage });

function SummonPage() {
	const state = useGacha();
	const [results, setResults] = useState<PullResult[]>([]);
	const [ratesOpen, setRatesOpen] = useState(false);

	const ownedCount = Object.keys(state.owned).length;
	const srPity = Math.min(state.pitySr, PITY_SR);
	const urPity = Math.min(state.pityUr, PITY_UR);

	const doSummon = (count: 1 | 10) => {
		const pulled = summon(count);
		if (pulled) setResults(pulled);
	};

	return (
		<div className="summon-page">
			<section className="summon-hero">
				<h1 className="font-myfont summon-title">
					<span className="sr-only">Hey! I'm Tristen.</span>
					<TypingGreeting />
				</h1>
				<p className="summon-sub section-sub">
					&gt;_ OPERATOR FILES DETECTED. SPEND CREDITS TO DECRYPT THE CAREER OF
					A SOFTWARE ENGINEER.
				</p>

				{state.characterAcquired ? (
					<Link
						to="/collection"
						search={{ card: CHARACTER_CARD.id }}
						className="summon-operator"
						aria-label="View operator card in database"
					>
						<span className="summon-operator-inner">
							<GachaCardFace card={CHARACTER_CARD} state="owned" />
						</span>
					</Link>
				) : (
					<div className="first-pull-callout">
						<span className="first-pull-spark" aria-hidden="true">
							✦
						</span>
						FIRST SUMMON FREE — GUARANTEED UR OPERATOR
					</div>
				)}

				<div className="pity-row">
					<PityMeter label="SR+ PITY" value={srPity} max={PITY_SR} />
					<PityMeter label="UR PITY" value={urPity} max={PITY_UR} />
				</div>

				<div className="summon-actions">
					<button
						type="button"
						className="btn btn-neon btn-lg"
						disabled={state.credits < PULL_COST}
						onClick={() => doSummon(1)}
					>
						SUMMON ×1 — {PULL_COST}◈
					</button>
					<button
						type="button"
						className="btn btn-magenta btn-lg"
						disabled={state.credits < TEN_PULL_COST}
						onClick={() => doSummon(10)}
					>
						SUMMON ×10 — {TEN_PULL_COST}◈
					</button>
					<button
						type="button"
						className="btn btn-ghost"
						onClick={() => setRatesOpen(true)}
					>
						RATES
					</button>
				</div>

				<dl className="summon-stats">
					<div>
						<dt>PULLS</dt>
						<dd>{state.totalPulls}</dd>
					</div>
					<div>
						<dt>COLLECTION</dt>
						<dd>
							{ownedCount}/{ALL_CARDS.length}
						</dd>
					</div>
					<div>
						<dt>CREDITS</dt>
						<dd>{state.credits}◈</dd>
					</div>
				</dl>

				<p className="summon-foot">
					<Link to="/collection" className="neon-link">
						VIEW DATABASE ▸
					</Link>
					<span className="dim"> — or — </span>
					<button
						type="button"
						className="linklike dim"
						onClick={() => {
							if (window.confirm("Wipe save? All cards and credits are lost."))
								resetSave();
						}}
					>
						WIPE SAVE
					</button>
				</p>
			</section>

			<RatesModal open={ratesOpen} onClose={() => setRatesOpen(false)} />
			<PullReveal
				results={results}
				onClose={() => setResults([])}
				onSummonAgain={doSummon}
			/>
		</div>
	);
}

function PityMeter({
	label,
	value,
	max,
}: {
	label: string;
	value: number;
	max: number;
}) {
	return (
		<div className="pity-meter">
			<span className="pity-label">
				{label} {value}/{max}
			</span>
			<span className="pity-track">
				<span
					className="pity-fill"
					style={{ width: `${(value / max) * 100}%` }}
				/>
			</span>
		</div>
	);
}
