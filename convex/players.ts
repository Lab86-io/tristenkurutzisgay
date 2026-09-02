import { ALL_CARDS, PULLABLE_BY_RARITY, RARITY_META, RARITY_ORDER, type Rarity } from "../src/data/cards";
import {
	PITY_SR,
	PITY_UR,
	PULL_COST,
	START_CREDITS,
	STIPEND_AMOUNT,
	TEN_PULL_COST,
} from "../src/lib/gacha";
import { evaluateAchievements, type Achievement } from "./achievements";
import { v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

type PlayerDoc = Doc<"players">;
type PlayerId = Id<"players">;

interface PlayerState {
	credits: number;
	pitySr: number;
	pityUr: number;
	totalPulls: number;
	owned: Record<string, { count: number; firstAcquired: number }>;
	characterAcquired: boolean;
	lastStipendDate: string | null;
	streak: number;
	achievements: Record<string, number>;
}

function publicState(player: PlayerDoc): PlayerState {
	return {
		credits: player.credits,
		pitySr: player.pitySr,
		pityUr: player.pityUr,
		totalPulls: player.totalPulls,
		owned: player.owned,
		characterAcquired: player.characterAcquired,
		lastStipendDate: player.lastStipendDate ?? null,
		streak: player.streak,
		achievements: player.achievements,
	};
}

async function getPlayer(ctx: QueryCtx): Promise<PlayerDoc | null> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) return null;
	return await ctx.db
		.query("players")
		.withIndex("by_userId", (q) => q.eq("userId", identity.subject))
		.unique();
}

async function ensurePlayer(ctx: MutationCtx): Promise<PlayerDoc> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) throw new Error("SIGN_IN_REQUIRED");

	const existing = await ctx.db
		.query("players")
		.withIndex("by_userId", (q) => q.eq("userId", identity.subject))
		.unique();
	if (existing) return existing;

	const now = Date.now();
	const playerId: PlayerId = await ctx.db.insert("players", {
		userId: identity.subject,
		displayName: identity.name ?? identity.nickname ?? "OPERATOR",
		credits: START_CREDITS,
		pitySr: 0,
		pityUr: 0,
		totalPulls: 0,
		owned: {},
		characterAcquired: false,
		lastStipendDate: null,
		streak: 0,
		achievements: {},
		createdAt: now,
		updatedAt: now,
	});
	return (await ctx.db.get(playerId)) as PlayerDoc;
}

function rollCard(pitySr: number, pityUr: number) {
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
	const pool = PULLABLE_BY_RARITY[rarity];
	const total = pool.reduce((sum, card) => sum + card.weight, 0);
	let roll = Math.random() * total;
	for (const card of pool) {
		roll -= card.weight;
		if (roll < 0) return card;
	}
	return pool[pool.length - 1];
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

const DUPE_REFUNDS: Record<Rarity, number> = {
	UR: 500,
	SSR: 200,
	SR: 80,
	R: 40,
	C: 20,
};

const FREE_CHARACTER_ID = "tk-character";

export const getState = query({
	args: {},
	handler: async (ctx): Promise<PlayerState | null> => {
		const player = await getPlayer(ctx);
		return player ? publicState(player) : null;
	},
});

export const summon = mutation({
	args: { count: v.union(v.literal(1), v.literal(10)) },
	handler: async (ctx, args) => {
		const player = await ensurePlayer(ctx);
		const freeFirst = !player.characterAcquired;
		const cost = freeFirst ? 0 : args.count === 1 ? PULL_COST : TEN_PULL_COST;
		if (player.credits < cost) {
			throw new Error("INSUFFICIENT_CREDITS");
		}

		let credits = player.credits;
		let pitySr = player.pitySr;
		let pityUr = player.pityUr;
		let totalPulls = player.totalPulls;
		const owned = { ...player.owned };
		let characterAcquired = player.characterAcquired;

		const results: Array<{
			seq: number;
			cardId: string;
			isDupe: boolean;
			refund: number;
		}> = [];
		let seq = 0;

		if (!characterAcquired) {
			owned[FREE_CHARACTER_ID] = {
				count: (owned[FREE_CHARACTER_ID]?.count ?? 0) + 1,
				firstAcquired: Date.now(),
			};
			results.push({ seq: seq++, cardId: FREE_CHARACTER_ID, isDupe: false, refund: 0 });
			characterAcquired = true;
		}

		for (let i = 0; i < args.count; i += 1) {
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
			const refund = isDupe ? DUPE_REFUNDS[card.rarity] : 0;
			credits += refund;
			owned[card.id] = {
				count: (existing?.count ?? 0) + 1,
				firstAcquired: existing?.firstAcquired ?? Date.now(),
			};
			results.push({ seq: seq++, cardId: card.id, isDupe, refund });
		}
		credits -= cost;

		const draft: PlayerDoc = {
			...player,
			credits,
			pitySr,
			pityUr,
			totalPulls,
			owned,
			characterAcquired,
		};
		const unlocked: Achievement[] = evaluateAchievements(draft, {
			summoned: results.map((result) => ({
				rarity: ALL_CARDS.find((card) => card.id === result.cardId)?.rarity ?? "C",
			})),
			count: args.count,
		});
		let rewardTotal = 0;
		const achievements = { ...player.achievements };
		for (const achievement of unlocked) {
			achievements[achievement.id] = Date.now();
			rewardTotal += achievement.reward;
		}
		credits += rewardTotal;

		const updated: PlayerDoc = {
			...draft,
			credits,
			achievements,
			updatedAt: Date.now(),
		};
		await ctx.db.replace(player._id, updated);

		return {
			results,
			unlocked,
			state: publicState(updated),
		};
	},
});

export const claimStipend = mutation({
	args: {},
	handler: async (ctx) => {
		const player = await ensurePlayer(ctx);
		const today = new Date().toISOString().slice(0, 10);
		if (player.lastStipendDate === today) {
			return { claimed: false as const, unlocked: [], state: publicState(player) };
		}
		const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
		const streak = player.lastStipendDate === yesterday ? player.streak + 1 : 1;

		const draft: PlayerDoc = {
			...player,
			credits: player.credits + STIPEND_AMOUNT,
			lastStipendDate: today,
			streak,
		};
		const unlocked = evaluateAchievements(draft, { streak });
		let rewardTotal = 0;
		const achievements = { ...player.achievements };
		for (const achievement of unlocked) {
			achievements[achievement.id] = Date.now();
			rewardTotal += achievement.reward;
		}

		const updated: PlayerDoc = {
			...draft,
			credits: draft.credits + rewardTotal,
			achievements,
			updatedAt: Date.now(),
		};
		await ctx.db.replace(player._id, updated);
		return {
			claimed: true as const,
			unlocked,
			state: publicState(updated),
		};
	},
});

export const resetSave = mutation({
	args: {},
	handler: async (ctx) => {
		const player = await ensurePlayer(ctx);
		const now = Date.now();
		await ctx.db.replace(player._id, {
			userId: player.userId,
			displayName: player.displayName,
			credits: START_CREDITS,
			pitySr: 0,
			pityUr: 0,
			totalPulls: 0,
			owned: {},
			characterAcquired: false,
			lastStipendDate: null,
			streak: 0,
			achievements: {},
			createdAt: player.createdAt,
			updatedAt: now,
		});
	},
});
