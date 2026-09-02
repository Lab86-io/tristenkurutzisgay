import { SignInButton } from "@clerk/tanstack-react-start";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CardDetail } from "#/components/gacha/CardDetail";
import { GachaCardFace } from "#/components/gacha/GachaCard";
import { Modal } from "#/components/gacha/Modal";
import { RARITY_ORDER, type Rarity } from "#/data/cards";
import { useCards } from "#/hooks/useCards";
import { useGachaSession } from "#/hooks/useGacha";

type CollectionSearch = { card?: string };

export const Route = createFileRoute("/collection")({
	validateSearch: (search: Record<string, unknown>): CollectionSearch => ({
		card: typeof search.card === "string" ? search.card : undefined,
	}),
	head: () => ({
		meta: [{ title: "INVENTORY — TRISTEN KURUTZ" }],
	}),
	component: CollectionPage,
});

function CollectionPage() {
	const { status, state } = useGachaSession();
	const { cards, byId } = useCards();
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const [rarityFilter, setRarityFilter] = useState<Rarity | "ALL">("ALL");
	const [ownedOnly, setOwnedOnly] = useState(false);

	const selected =
		search.card && state.owned[search.card] ? byId.get(search.card) : undefined;

	const visible = cards.filter(
		(card) =>
			(rarityFilter === "ALL" || card.rarity === rarityFilter) &&
			(!ownedOnly || state.owned[card.id]),
	);

	return (
		<div className="collection-page">
			<h1 className="page-title font-myfont">INVENTORY</h1>
			{status === "ready" ? (
				<p className="section-sub">
					{Object.keys(state.owned).length} of {cards.length} records decrypted
					— keep pulling.
				</p>
			) : (
				<p className="section-sub">
					{status === "signed-out" ? (
						<SignInButton mode="modal">
							<button type="button" className="linklike neon-link">
								SIGN IN
							</button>
						</SignInButton>
					) : (
						<span>connecting…</span>
					)}{" "}
					to build your inventory — it saves to your account.
				</p>
			)}

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
