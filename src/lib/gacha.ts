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
	lastStipendDate: string | null;
	streak: number;
	achievements: Record<string, number>;
}

export interface PullResult {
	seq: number;
	cardId: string;
	isDupe: boolean;
	refund: number;
}

export interface UnlockedAchievement {
	id: string;
	name: string;
	description: string;
	reward: number;
}

export function defaultGachaState(): GachaState {
	return {
		credits: START_CREDITS,
		pitySr: 0,
		pityUr: 0,
		totalPulls: 0,
		owned: {},
		characterAcquired: false,
		lastStipendDate: null,
		streak: 0,
		achievements: {},
	};
}

export function todayKey(now = Date.now()): string {
	return new Date(now).toISOString().slice(0, 10);
}

export function yesterdayKey(now = Date.now()): string {
	return new Date(now - 86_400_000).toISOString().slice(0, 10);
}
