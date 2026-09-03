import { ALL_CARDS, CARD_POOL, RARITY_META, RARITY_ORDER, type Rarity } from "../src/data/cards";
import {
	CONTACT_REWARD,
	MINE_DAILY_CAP,
	PITY_SR,
	PITY_UR,
	PULL_COST,
	START_CREDITS,
	STIPEND_AMOUNT,
	TEN_PULL_COST,
} from "../src/lib/gacha";
import { evaluateAchievements, type Achievement } from "./achievements";
import { requireAdmin } from "./cards";
import { v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
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
	minedToday: number;
	contactRewarded: boolean;
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
		minedToday: player.minedDate === new Date().toISOString().slice(0, 10) ? (player.minedToday ?? 0) : 0,
		contactRewarded: player.contactRewarded ?? false,
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

interface PoolCard {
	id: string;
	type: "CHARACTER" | "ROLE" | "PROJECT" | "SKILL";
	rarity: Rarity;
	weight: number;
}

function rollCard(
	poolsByRarity: Record<Rarity, PoolCard[]>,
	pitySr: number,
	pityUr: number,
): PoolCard {
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
	const pool = poolsByRarity[rarity];
	if (pool.length === 0) {
		// rarity tier has no active cards — degrade to whatever exists
		const anyPool = Object.values(poolsByRarity).filter((p) => p.length > 0);
		const fallback = anyPool[anyPool.length - 1] ?? [];
		return fallback[fallback.length - 1];
	}
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
		// the very first ×1 summon is free: guaranteed UR operator card
		const freeFirst = !player.characterAcquired && args.count === 1;
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

		// card pool comes from the database (admin-managed), falling back to the
		// seed data if the table hasn't been seeded yet
		const cardDocs = await ctx.db.query("cards").collect();
		const characterCard: PoolCard | undefined = cardDocs.length
			? (() => {
					const doc = cardDocs.find((c) => c.cardId === FREE_CHARACTER_ID);
					return doc
						? { id: doc.cardId, type: doc.type, rarity: doc.rarity, weight: doc.weight }
						: undefined;
				})()
			: ALL_CARDS.find((card) => card.id === FREE_CHARACTER_ID);
		const pool: PoolCard[] = cardDocs.length
			? cardDocs
					.filter((doc) => doc.active !== false && doc.type !== "CHARACTER")
					.map((doc) => ({
						id: doc.cardId,
						type: doc.type,
						rarity: doc.rarity,
						weight: doc.weight,
					}))
			: CARD_POOL.map((card) => ({
						id: card.id,
						type: card.type,
						rarity: card.rarity,
						weight: card.weight,
				}));

		const poolsByRarity: Record<Rarity, PoolCard[]> = {
			UR: pool.filter((card) => card.rarity === "UR"),
			SSR: pool.filter((card) => card.rarity === "SSR"),
			SR: pool.filter((card) => card.rarity === "SR"),
			R: pool.filter((card) => card.rarity === "R"),
			C: pool.filter((card) => card.rarity === "C"),
		};

		for (let i = 0; i < args.count; i += 1) {
			const card = rollCard(poolsByRarity, pitySr, pityUr);
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
			let refund = isDupe ? DUPE_REFUNDS[card.rarity] : 0;
			// 5% dupe jackpot: refund pays out 10x
			if (isDupe && Math.random() < 0.05) refund *= 10;
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
				rarity:
					pool.find((card) => card.id === result.cardId)?.rarity ??
					characterCard?.rarity ??
					"UR",
			})),
			count: args.count,
			allCards: [...pool, ...(characterCard ? [characterCard] : [])].map(
				(card) => ({ id: card.id, type: card.type }),
			),
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
			minedToday: 0,
			minedDate: undefined,
			contactRewarded: false,
			createdAt: player.createdAt,
			updatedAt: now,
		});
	},
});

export const mine = mutation({
	args: { amount: v.number() },
	handler: async (ctx, args) => {
		const player = await ensurePlayer(ctx);
		if (
			!Number.isInteger(args.amount) ||
			args.amount < 1 ||
			args.amount > 200
		) {
			throw new Error("INVALID_MINING_BATCH");
		}

		const today = new Date().toISOString().slice(0, 10);
		const minedToday =
			player.minedDate === today ? (player.minedToday ?? 0) : 0;
		const granted = Math.max(0, Math.min(args.amount, MINE_DAILY_CAP - minedToday));

		const updated: PlayerDoc = {
			...player,
			credits: player.credits + granted,
			minedToday: minedToday + granted,
			minedDate: today,
			updatedAt: Date.now(),
		};
		await ctx.db.replace(player._id, updated);
		return { granted, minedToday: updated.minedToday ?? 0, state: publicState(updated) };
	},
});

	export const sendMessage = mutation({
	args: {
		name: v.string(),
		email: v.string(),
		message: v.string(),
	},
	handler: async (ctx, args) => {
		const player = await ensurePlayer(ctx);
		const name = args.name.trim().slice(0, 80);
		const email = args.email.trim().slice(0, 120);
		const message = args.message.trim().slice(0, 2000);
		if (!name || !email.includes("@") || message.length < 10) {
			throw new Error("INVALID_MESSAGE");
		}

		const rewardDue = !player.contactRewarded;
		await ctx.db.insert("messages", {
			userId: player.userId,
			name,
			email,
			message,
			rewardGranted: rewardDue,
			createdAt: Date.now(),
		});

		// fire-and-forget email notification to the owner
		await ctx.scheduler.runAfter(0, internal.emails.sendContactEmail, {
			name,
			email,
			message,
		});

		let updated: PlayerDoc = {
			...player,
			contactRewarded: true,
			updatedAt: Date.now(),
		};
		if (rewardDue) {
			updated = { ...updated, credits: updated.credits + CONTACT_REWARD };
		}
		await ctx.db.replace(player._id, updated);
		return { rewardGranted: rewardDue, reward: rewardDue ? CONTACT_REWARD : 0, state: publicState(updated) };
	},
});

export const listMessages = query({
	args: {},
	handler: async (ctx) => {
		await requireAdmin(ctx);
		const docs = await ctx.db.query("messages").collect();
		return docs.sort((a, b) => b.createdAt - a.createdAt);
	},
});

// answer key for the OPERATOR EXAM quiz on the dossier page
const EXAM_ANSWERS = [2, 0, 3];

export const submitExam = mutation({
	args: { answers: v.array(v.number()) },
	handler: async (ctx, args) => {
		const player = await ensurePlayer(ctx);
		const passed =
			args.answers.length === EXAM_ANSWERS.length &&
			EXAM_ANSWERS.every((answer, index) => args.answers[index] === answer);
		if (!passed) {
			return { passed: false as const, unlocked: [], state: publicState(player) };
		}

		const draft: PlayerDoc = {
			...player,
			contactRewarded: player.contactRewarded ?? false,
		};
		const unlocked = evaluateAchievements(draft, { examPassed: true });
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
		return { passed: true as const, unlocked, state: publicState(updated) };
	},
});
