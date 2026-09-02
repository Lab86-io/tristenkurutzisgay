import { useQuery } from "convex/react";
import { ALL_CARDS, type GachaCard } from "#/data/cards";
import { api } from "../../convex/_generated/api";

/**
 * Card pool as managed from the admin page. Falls back to the seed data
 * while loading (or if the table is empty/unseeded) so the UI always
 * renders.
 */
export function useCards(): {
	cards: GachaCard[];
	byId: Map<string, GachaCard>;
	loaded: boolean;
} {
	const dbCards = useQuery(api.cards.list);
	const cards: GachaCard[] = dbCards ?? ALL_CARDS;
	const byId = new Map(cards.map((card) => [card.id, card]));
	return { cards, byId, loaded: dbCards !== undefined };
}
