import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CardDetail } from "#/components/gacha/CardDetail";
import { GachaCardFace } from "#/components/gacha/GachaCard";
import { Modal } from "#/components/gacha/Modal";
import { ALL_CARDS, CARD_BY_ID, RARITY_ORDER, type Rarity } from "#/data/cards";
import { useGacha } from "#/hooks/useGacha";

type CollectionSearch = { card?: string };

export const Route = createFileRoute("/collection")({
	validateSearch: (search: Record<string, unknown>): CollectionSearch => ({
		card: typeof search.card === "string" ? search.card : undefined,
	}),
	head: () => ({
		meta: [{ title: "DATABASE — TRISTEN KURUTZ" }],
	}),
	component: CollectionPage,
});

function CollectionPage() {
	const state = useGacha();
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const [rarityFilter, setRarityFilter] = useState<Rarity | "ALL">("ALL");
	const [ownedOnly, setOwnedOnly] = useState(false);

	const selected =
		search.card && state.owned[search.card]
			? CARD_BY_ID.get(search.card)
			: undefined;

	const visible = ALL_CARDS.filter(
		(card) =>
			(rarityFilter === "ALL" || card.rarity === rarityFilter) &&
			(!ownedOnly || state.owned[card.id]),
	);

	return (
		<div className="collection-page">
			<h1 className="page-title font-myfont">DATABASE</h1>
			<p className="section-sub">
				&gt;_ {Object.keys(state.owned).length}/{ALL_CARDS.length} RECORDS
				DECRYPTED. PULL TO UNLOCK THE REST.
			</p>

			<div className="filter-row">
				{(["ALL", ...RARITY_ORDER] as const).map((filter) => (
					<button
						key={filter}
						type="button"
						className={`filter-chip ${rarityFilter === filter ? "filter-chip-on" : ""}`}
						data-rarity={filter}
						onClick={() => setRarityFilter(filter)}
					>
						{filter}
					</button>
				))}
				<button
					type="button"
					className={`filter-chip ${ownedOnly ? "filter-chip-on" : ""}`}
					onClick={() => setOwnedOnly((value) => !value)}
				>
					OWNED
				</button>
			</div>

			<div className="collection-grid">
				{visible.map((card) => {
					const owned = state.owned[card.id];
					return (
						<button
							key={card.id}
							type="button"
							className="collection-slot"
							data-locked={!owned}
							onClick={() => {
								if (owned) navigate({ search: { card: card.id } });
							}}
						>
							<GachaCardFace
								card={card}
								state={owned ? "owned" : "locked"}
								count={owned?.count}
							/>
						</button>
					);
				})}
			</div>

			<Modal
				open={Boolean(selected)}
				onClose={() => navigate({ search: {} })}
				label={selected ? `${selected.name} details` : "Card details"}
			>
				{selected && (
					<CardDetail
						card={selected}
						count={state.owned[selected.id]?.count}
						firstAcquired={state.owned[selected.id]?.firstAcquired}
					/>
				)}
			</Modal>
		</div>
	);
}
