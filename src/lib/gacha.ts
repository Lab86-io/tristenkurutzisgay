import {
	CHARACTER_CARD,
	type GachaCard,
	PULLABLE_BY_RARITY,
	RARITY_META,
	RARITY_ORDER,
	type Rarity,
} from "#/data/cards";

export const START_CREDITS = 1000;
export const PULL_COST = 100;
export const TEN_PULL_COST = 900;
export const STIPEND_AMOUNT = 600;
export const PITY_SR = 10;
export const PITY_UR = 90;

export interface OwnedEntry {
	count: number;
	firstAcquired: number;
}

export interface GachaState {
	credits: number;
	pitySr: number;
	pityUr: number;
	totalPulls: number;
	owned: Record<string, OwnedEntry>;
	characterAcquired: boolean;
	stipendDate: string | null;
}

export interface PullResult {
	seq: number;
	card: GachaCard;
	isDupe: boolean;
	refund: number;
}

const STORAGE_KEY = "tk-gacha-v1";

function defaultState(): GachaState {
	return {
		credits: START_CREDITS,
		pitySr: 0,
		pityUr: 0,
		totalPulls: 0,
		owned: {},
		characterAcquired: false,
		stipendDate: null,
	};
}

function loadState(): GachaState {
	if (typeof window === "undefined") return defaultState();
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return defaultState();
		const parsed = JSON.parse(raw) as Partial<GachaState>;
		return { ...defaultState(), ...parsed };
	} catch {
		return defaultState();
	}
}

function todayKey(): string {
	return new Date().toISOString().slice(0, 10);
}

type Listener = () => void;

class GachaStore {
	private state: GachaState = defaultState();
	private listeners = new Set<Listener>();
	private hydrated = false;

	hydrate() {
		if (this.hydrated || typeof window === "undefined") return;
		this.hydrated = true;
		this.state = loadState();
		this.emit();
	}

	subscribe = (listener: Listener) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	getSnapshot = (): GachaState => this.state;

	getServerSnapshot = (): GachaState => defaultState();

	private emit() {
		for (const listener of this.listeners) listener();
	}

	private commit(next: GachaState) {
		this.state = next;
		if (typeof window !== "undefined") {
			try {
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			} catch {
				// storage blocked; session-only play
			}
		}
		this.emit();
	}

	canAfford(count: 1 | 10): boolean {
		const cost = count === 1 ? PULL_COST : TEN_PULL_COST;
		return this.state.credits >= cost;
	}

	summon(count: 1 | 10): PullResult[] | null {
		let cost = count === 1 ? PULL_COST : TEN_PULL_COST;
		// the very first summon is free: guaranteed UR operator card
		const freeFirst = !this.state.characterAcquired;
		if (freeFirst) cost = 0;
		if (this.state.credits < cost) return null;

		const results: PullResult[] = [];
		let seq = 0;
		let { credits, pitySr, pityUr, totalPulls, owned, characterAcquired } =
			this.state;

		if (!characterAcquired) {
			owned = {
				...owned,
				[CHARACTER_CARD.id]: {
					count: (owned[CHARACTER_CARD.id]?.count ?? 0) + 1,
					firstAcquired: Date.now(),
				},
			};
			results.push({
				seq: seq++,
				card: CHARACTER_CARD,
				isDupe: false,
				refund: 0,
			});
			characterAcquired = true;
		}

		for (let i = 0; i < count; i += 1) {
			const card = rollCard(pitySr, pityUr);
			const existing = owned[card.id];

			if (card.rarity === "UR") {
				pitySr = 0;
				pityUr = 0;
			} else if (card.rarity === "SSR" || card.rarity === "SR") {
				pitySr = 0;
				pityUr += 1;
			} else {
				pitySr += 1;
				pityUr += 1;
			}
			totalPulls += 1;

			const isDupe = Boolean(existing);
			const refund = isDupe ? RARITY_META[card.rarity].dupeRefund : 0;
			credits += refund;
			owned = {
				...owned,
				[card.id]: {
					count: (existing?.count ?? 0) + 1,
					firstAcquired: existing?.firstAcquired ?? Date.now(),
				},
			};
			results.push({
				seq: seq++,
				card,
				isDupe,
				refund,
			});
		}

		this.commit({
			...this.state,
			credits: credits - cost,
			pitySr,
			pityUr,
			totalPulls,
			owned,
			characterAcquired,
		});
		return results;
	}
	claimStipend(): boolean {
		const today = todayKey();
		if (this.state.stipendDate === today) return false;
		this.commit({
			...this.state,
			credits: this.state.credits + STIPEND_AMOUNT,
			stipendDate: today,
		});
		return true;
	}

	stipendAvailable(): boolean {
		return this.state.stipendDate !== todayKey();
	}

	reset(): void {
		this.commit(defaultState());
	}
}

function rollCard(pitySr: number, pityUr: number): GachaCard {
	let rarity: Rarity;
	if (pityUr >= PITY_UR - 1) {
		rarity = "UR";
	} else if (pitySr >= PITY_SR - 1) {
		rarity = "SR";
	} else {
		rarity = rollRarity();
		if (rarity !== "UR" && rarity !== "SSR" && rarity !== "SR") {
			rarity = "SR";
		}
	}
	return pickWeighted(PULLABLE_BY_RARITY[rarity]);
}

function rollRarity(): Rarity {
	const roll = Math.random();
	let cumulative = 0;
	for (const rarity of RARITY_ORDER) {
		cumulative += RARITY_META[rarity].rate;
		if (roll < cumulative) return rarity;
	}
	return "C";
}

function pickWeighted(cards: GachaCard[]): GachaCard {
	const total = cards.reduce((sum, card) => sum + card.weight, 0);
	let roll = Math.random() * total;
	for (const card of cards) {
		roll -= card.weight;
		if (roll < 0) return card;
	}
	return cards[cards.length - 1];
}

export const gachaStore = new GachaStore();
