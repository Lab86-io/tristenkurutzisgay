import { SignInButton } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CardFan } from "#/components/gacha/CardFan";
import { Clicker } from "#/components/gacha/Clicker";
import { DailyOps } from "#/components/gacha/DailyOps";
import { PullReveal } from "#/components/gacha/PullReveal";
import { RatesModal } from "#/components/gacha/RatesModal";
import { TypingGreeting } from "#/components/TypingGreeting";
import { useCards } from "#/hooks/useCards";
import type { RevealCard } from "#/hooks/useGacha";
import { useGachaSession, useResetSave, useSummon } from "#/hooks/useGacha";
import { PULL_COST, TEN_PULL_COST } from "#/lib/gacha";

export const Route = createFileRoute("/")({ component: SummonPage });

function SummonPage() {
	const { status, state } = useGachaSession();
	const { cards } = useCards();
	const featured = cards.filter(
		(card) =>
			card.type !== "CHARACTER" &&
			(card.rarity === "UR" || card.rarity === "SSR"),
	);
	const summon = useSummon();
	const resetSave = useResetSave();
	const [results, setResults] = useState<RevealCard[]>([]);
	const [ratesOpen, setRatesOpen] = useState(false);

	const ownedCount = Object.keys(state.owned).length;

	const doSummon = async (count: 1 | 10) => {
		const outcome = await summon(count);
		if (outcome) setResults(outcome.results);
	};

	return (
		<div className="summon-page">
			<section
				className="summon-hero"
				data-cols={status === "ready" ? "2" : "1"}
			>
				<div className="summon-col">
					<h1 className="font-myfont summon-title">
						<span className="sr-only">Hey! I'm Tristen.</span>
						<TypingGreeting />
					</h1>
					<p className="summon-sub section-sub">
						A résumé you have to pull for. Sign in, earn credits, and decrypt
						Tristen's career one card at a time.
					</p>

					{status === "signed-out" && (
						<div className="first-pull-callout">
							Sign in to play — progress saves to your account.
						</div>
					)}

					<div className="summon-actions">
						{status === "signed-out" ? (
							<SignInButton mode="modal">
								<button type="button" className="btn btn-neon btn-lg">
									Sign in to summon
								</button>
							</SignInButton>
						) : (
							<>
								<button
									type="button"
									className="btn btn-neon btn-lg"
									disabled={
										state.characterAcquired && state.credits < PULL_COST
									}
									onClick={() => doSummon(1)}
								>
									Summon ×1 —{" "}
									{state.characterAcquired ? `${PULL_COST}◈` : "free"}
								</button>
								<button
									type="button"
									className="btn btn-magenta btn-lg"
									disabled={state.credits < TEN_PULL_COST}
									onClick={() => doSummon(10)}
								>
									Summon ×10 — {TEN_PULL_COST}◈
								</button>
							</>
						)}
						<button
							type="button"
							className="btn btn-ghost"
							onClick={() => setRatesOpen(true)}
						>
							Rates
						</button>
					</div>

					<dl className="summon-stats">
						<div>
							<dt>Pulls</dt>
							<dd>{status === "ready" ? state.totalPulls : "—"}</dd>
						</div>
						<div>
							<dt>Inventory</dt>
							<dd>
								{status === "ready" ? ownedCount : "—"}/{cards.length}
							</dd>
						</div>
						<div>
							<dt>Credits</dt>
							<dd>{status === "ready" ? `${state.credits}◈` : "—"}</dd>
						</div>
					</dl>

					<p className="summon-foot">
						<Link to="/collection" className="neon-link">
							View inventory ▸
						</Link>
						{status === "ready" && (
							<>
								<span className="dim"> — or — </span>
								<button
									type="button"
									className="linklike dim"
									onClick={() => {
										if (
											window.confirm(
												"Wipe save? All cards and credits are lost.",
											)
										) {
											resetSave();
										}
									}}
								>
									Wipe save
								</button>
							</>
						)}
					</p>
				</div>

				<div className="summon-col">
					<CardFan cards={featured} />
					<DailyOps />
					{status === "ready" && <Clicker minedToday={state.minedToday} />}
				</div>
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
