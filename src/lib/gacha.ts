export const START_CREDITS = 0;
export const PULL_COST = 100;
export const TEN_PULL_COST = 900;
export const STIPEND_AMOUNT = 150;
export const PITY_SR = 10;
export const PITY_UR = 90;
export const CONTACT_REWARD = 900;
export const MINE_PER_CLICK = 1;
export const MINE_CRIT_CHANCE = 0.1;
export const MINE_CRIT_BONUS = 4;
export const MINE_DAILY_CAP = 300;
export const CIPHER_REWARD = 120;
export const RECALL_REWARD = 80;
export const SCAN_REWARD = 10;
export const SCAN_MAX = 3;
export const RECALL_MAX_MOVES = 20;
export const RECALL_PAIRS = 6;
export const MINE_COMBO_STEP = 0.1;
export const MINE_COMBO_MAX = 2;
export const MINE_COMBO_WINDOW_MS = 800;

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
	minedToday: number;
	contactRewarded: boolean;
	dailyDate: string | null;
	dailyCipher: boolean;
	dailyRecall: boolean;
	dailyScanned: string[];
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
		minedToday: 0,
		contactRewarded: false,
		dailyDate: null,
		dailyCipher: false,
		dailyRecall: false,
		dailyScanned: [],
	};
}

export function todayKey(now = Date.now()): string {
	return new Date(now).toISOString().slice(0, 10);
}

export function yesterdayKey(now = Date.now()): string {
	return new Date(now - 86_400_000).toISOString().slice(0, 10);
}
