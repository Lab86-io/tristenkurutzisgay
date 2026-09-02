import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	players: defineTable({
		userId: v.string(),
		displayName: v.optional(v.string()),
		credits: v.number(),
		pitySr: v.number(),
		pityUr: v.number(),
		totalPulls: v.number(),
		owned: v.record(
			v.string(),
			v.object({
				count: v.number(),
				firstAcquired: v.number(),
			}),
		),
		characterAcquired: v.boolean(),
		lastStipendDate: v.union(v.string(), v.null()),
		streak: v.number(),
		achievements: v.record(v.string(), v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_userId", ["userId"]),
});
