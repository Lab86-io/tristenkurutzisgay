import { v } from "convex/values";
import { query, mutation, internalMutation, type MutationCtx, type QueryCtx } from "./_generated/server";
import { ALL_CARDS as SEED_ALL_CARDS } from "../src/data/cards";

const cardValidator = v.object({
	id: v.string(),
	name: v.string(),
	type: v.union(
		v.literal("CHARACTER"),
		v.literal("ROLE"),
		v.literal("PROJECT"),
		v.literal("SKILL"),
	),
	rarity: v.union(
		v.literal("UR"),
		v.literal("SSR"),
		v.literal("SR"),
		v.literal("R"),
		v.literal("C"),
	),
	weight: v.number(),
	active: v.boolean(),
	tagline: v.string(),
	description: v.string(),
	details: v.array(v.string()),
	tags: v.array(v.string()),
	links: v.array(v.object({ label: v.string(), href: v.string() })),
	note: v.optional(v.string()),
});

export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<string> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) throw new Error("SIGN_IN_REQUIRED");
	const ownerEmails = (process.env.OWNER_EMAILS ?? "tristenkurutz@gmail.com")
		.split(",")
		.map((email) => email.trim().toLowerCase());
	const email = (identity.email ?? "").toLowerCase();
	if (!email || !ownerEmails.includes(email)) {
		throw new Error("ADMIN_ONLY");
	}
	return email;
}

export const list = query({
	args: {},
	handler: async (ctx) => {
		const docs = await ctx.db.query("cards").collect();
		if (docs.length === 0) {
			return SEED_ALL_CARDS.map((card) => ({ ...card, active: true }));
		}
		return docs
			.map((doc) => ({
				id: doc.cardId,
				name: doc.name,
				type: doc.type,
				rarity: doc.rarity,
				weight: doc.weight,
				active: doc.active,
				tagline: doc.tagline,
				description: doc.description,
				details: doc.details,
				tags: doc.tags,
				links: doc.links,
				note: doc.note,
			}))
			.sort((a, b) => a.id.localeCompare(b.id));
	},
});

export const seedIfEmpty = mutation({
	args: {},
	handler: async (ctx) => {
		const existing = await ctx.db.query("cards").collect();
		if (existing.length > 0) return { seeded: 0, existing: existing.length };
		const now = Date.now();
		for (const card of SEED_ALL_CARDS) {
			await ctx.db.insert("cards", {
				cardId: card.id,
				name: card.name,
				type: card.type,
				rarity: card.rarity,
				weight: card.weight,
				active: true,
				tagline: card.tagline,
				description: card.description,
				details: card.details ?? [],
				tags: card.tags,
				links: card.links ?? [],
				note: card.note,
				createdAt: now,
			});
		}
		return { seeded: SEED_ALL_CARDS.length, existing: 0 };
	},
});

export const upsertCard = mutation({
	args: { card: cardValidator },
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		const card = args.card;
		if (card.weight < 0 || card.weight > 100) {
			throw new Error("WEIGHT_OUT_OF_RANGE");
		}
		const existing = await ctx.db
			.query("cards")
			.withIndex("by_cardId", (q) => q.eq("cardId", card.id))
			.unique();

		const doc = {
			cardId: card.id,
			name: card.name,
			type: card.type,
			rarity: card.rarity,
			weight: card.weight,
			active: card.active,
			tagline: card.tagline,
			description: card.description,
			details: card.details,
			tags: card.tags,
			links: card.links,
			note: card.note,
		};

		if (existing) {
			await ctx.db.replace(existing._id, { ...doc, createdAt: existing.createdAt });
			return { id: card.id, created: false };
		}
		await ctx.db.insert("cards", { ...doc, createdAt: Date.now() });
		return { id: card.id, created: true };
	},
});

export const deleteCard = mutation({
	args: { id: v.string() },
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		if (args.id === "tk-character") {
			throw new Error("PROTECTED_CARD");
		}
		const existing = await ctx.db
			.query("cards")
			.withIndex("by_cardId", (q) => q.eq("cardId", args.id))
			.unique();
		if (!existing) throw new Error("NOT_FOUND");
		await ctx.db.delete(existing._id);
		return { deleted: args.id };
	},
});

// One-shot sync of the card table from the seed data (title-case pass).
// Internal so it can only be run from the CLI, never from the client.
export const refreshFromSeed = internalMutation({
	args: {},
	handler: async (ctx) => {
		const docs = await ctx.db.query("cards").collect();
		let updated = 0;
		for (const doc of docs) {
			const seed = SEED_ALL_CARDS.find((card) => card.id === doc.cardId);
			if (!seed) continue;
			await ctx.db.replace(doc._id, {
				cardId: doc.cardId,
				name: seed.name,
				type: seed.type,
				rarity: seed.rarity,
				weight: doc.weight,
				active: doc.active,
				tagline: seed.tagline,
				description: seed.description,
				details: seed.details ?? [],
				tags: seed.tags,
				links: seed.links ?? [],
				note: seed.note,
				createdAt: doc.createdAt ?? Date.now(),
			});
			updated += 1;
		}
		return { updated };
	},
});
