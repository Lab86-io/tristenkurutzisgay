import { ALL_CARDS } from "../data/cards";

export interface Achievement {
	id: string;
	name: string;
	description: string;
	reward: number;
}

export interface AchievementContext {
	summoned?: Array<{ rarity: string }>;
	count?: 1 | 10;
	streak?: number;
	examPassed?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
	{
		id: "first-contact",
		name: "📞 FIRST CONTACT",
		description: "Complete your first summon.",
		reward: 25,
	},
	{
		id: "first-sr",
		name: "📡 SIGNAL ACQUIRED",
		description: "Acquire your first SR or better.",
		reward: 25,
	},
	{
		id: "first-ssr",
		name: "💎 RARE FIND",
		description: "Acquire your first SSR.",
		reward: 50,
	},
	{
		id: "first-ur",
		name: "🌟 GOLDEN EYE",
		description: "Acquire your first UR.",
		reward: 75,
	},
	{
		id: "big-ten",
		name: "🎰 BIG TEN",
		description: "Land a 10-pull where every card is SR or better.",
		reward: 150,
	},
	{
		id: "archive-10",
		name: "🗂️ ARCHIVIST I",
		description: "Decrypt 10 unique records.",
		reward: 50,
	},
	{
		id: "archive-25",
		name: "🗂️ ARCHIVIST II",
		description: "Decrypt 25 unique records.",
		reward: 150,
	},
	{
		id: "skill-tree",
		name: "🌳 SKILL TREE",
		description: "Acquire every SKILL record.",
		reward: 100,
	},
	{
		id: "shipped",
		name: "🚀 SHIPPED",
		description: "Acquire every PROJECT record.",
		reward: 125,
	},
	{
		id: "hr-files",
		name: "📎 HR COMPLIANT",
		description: "Acquire every ROLE record.",
		reward: 150,
	},
	{
		id: "completionist",
		name: "🏁 SYSTEM COMPLETE",
		description: "Decrypt the entire inventory.",
		reward: 300,
	},
	{
		id: "dedicated",
		name: "🔥 DEDICATED",
		description: "Claim the daily uplink 7 days in a row.",
		reward: 100,
	},
	{
		id: "operator-exam",
		name: "🎓 OPERATOR EXAM",
		description: "Ace the exam about the person behind the cards.",
		reward: 100,
	},
];

export const ACHIEVEMENT_BY_ID = new Map(
	ACHIEVEMENTS.map((achievement) => [achievement.id, achievement]),
);

interface AchievementCheckState {
	owned: Record<string, unknown>;
	achievements: Record<string, number>;
}

function allOfTypeOwned(
	state: AchievementCheckState,
	type: (typeof ALL_CARDS)[number]["type"],
): boolean {
	return ALL_CARDS.filter((card) => card.type === type).every(
		(card) => state.owned[card.id],
	);
}

export function evaluateAchievements(
	state: AchievementCheckState,
	context: AchievementContext = {},
): Achievement[] {
	const unlocked: Achievement[] = [];
	const grant = (id: string, condition: boolean) => {
		if (!condition || state.achievements[id]) return;
		const achievement = ACHIEVEMENT_BY_ID.get(id);
		if (achievement) unlocked.push(achievement);
	};

	const summoned = context.summoned ?? [];
	const rarities = new Set(summoned.map((result) => result.rarity));
	const ownedCount = Object.keys(state.owned).length;

	grant("first-contact", summoned.length > 0);
	grant("first-ur", rarities.has("UR"));
	grant("first-ssr", rarities.has("SSR"));
	grant("first-sr", rarities.has("SR"));
	grant(
		"big-ten",
		context.count === 10 &&
			summoned.length === 10 &&
			summoned.every(
				(result) =>
					result.rarity === "UR" ||
					result.rarity === "SSR" ||
					result.rarity === "SR",
			),
	);
	grant("archive-10", ownedCount >= 10);
	grant("archive-25", ownedCount >= 25);
	grant("skill-tree", allOfTypeOwned(state, "SKILL"));
	grant("shipped", allOfTypeOwned(state, "PROJECT"));
	grant("hr-files", allOfTypeOwned(state, "ROLE"));
	grant(
		"completionist",
		ALL_CARDS.every((card) => state.owned[card.id]),
	);
	grant("dedicated", (context.streak ?? 0) >= 7);
	grant("operator-exam", context.examPassed === true);

	return unlocked;
}
