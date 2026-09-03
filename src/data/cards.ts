export type Rarity = "UR" | "SSR" | "SR" | "R" | "C";
export type CardType = "CHARACTER" | "ROLE" | "PROJECT" | "SKILL";

export interface CardLink {
	label: string;
	href: string;
}

export interface CardStat {
	label: string;
	value: number;
}

export interface GachaCard {
	id: string;
	name: string;
	type: CardType;
	rarity: Rarity;
	weight: number;
	tagline: string;
	description: string;
	details?: string[];
	tags: string[];
	links?: CardLink[];
	note?: string;
	stats?: CardStat[];
	/** inactive cards are excluded from the pull pool (admin-controlled) */
	active?: boolean;
}

export const RARITY_ORDER: Rarity[] = ["UR", "SSR", "SR", "R", "C"];

/** rarity level per tier — drives the orb pips (C=1 … UR=5) */
export const RARITY_LEVEL: Record<Rarity, number> = {
	UR: 5,
	SSR: 4,
	SR: 3,
	R: 2,
	C: 1,
};

export const RARITY_META: Record<
	Rarity,
	{ label: string; rate: number; dupeRefund: number }
> = {
	UR: { label: "Ultra rare", rate: 0.02, dupeRefund: 500 },
	SSR: { label: "S-special rare", rate: 0.08, dupeRefund: 200 },
	SR: { label: "Super rare", rate: 0.2, dupeRefund: 80 },
	R: { label: "RARE", rate: 0.3, dupeRefund: 40 },
	C: { label: "Common", rate: 0.4, dupeRefund: 20 },
};

export const CHARACTER_CARD: GachaCard = {
	id: "tk-character",
	name: "Tristen Kurutz",
	type: "CHARACTER",
	rarity: "UR",
	weight: 0,
	tagline: "Full-stack engineer · RIT '26",
	description:
		"Software engineering student at RIT graduating Dec 2026. Cares a lot about process and ethics in software — accessibility, maintainability, and security. Currently seeking full-time roles.",
	details: [
		"Built a Java test orchestration platform from the ground up as a solo project at M&T Bank.",
		"Led refactors, cut React warnings from 250+ to zero, and doubled a capstone team's sprint velocity.",
		"Outside the terminal: cat dad of two, amateur photographer, Rimworld addict, and dabbling in every craft available.",
	],
	tags: ["Full-stack", "Testing/CI", "OOP", "PM"],
	stats: [
		{ label: "Full-stack", value: 88 },
		{ label: "Testing / CI", value: 92 },
		{ label: "OOP design", value: 85 },
		{ label: "Team ops", value: 80 },
		{ label: "ETHICS", value: 99 },
	],
};

export const CARD_POOL: GachaCard[] = [
	// ---- UR (1%) ----
	{
		id: "exp-mt-se-2026",
		name: "M&T Bank — SE Intern",
		type: "ROLE",
		rarity: "UR",
		weight: 1,
		tagline: "Buffalo, NY · Jun 2026 – Aug 2026",
		description:
			"Designed and built a Java-based test orchestration platform from the ground up as a solo project, replacing a legacy ReadyAPI setup.",
		details: [
			"Migrated 255 API and message queue tests to Playwright, improving maintainability and enabling programmatic test control.",
			"Integrated the platform into GitLab CI/CD pipelines to automate weekly test execution across deployment workflows.",
		],
		tags: ["Java", "Playwright", "GitLab CI/CD"],
	},
	// ---- SSR (5%) ----
	{
		id: "prj-contrax",
		name: "Contrax",
		type: "PROJECT",
		rarity: "SSR",
		weight: 1,
		tagline: "Senior project, Mindex-sponsored",
		description:
			"React Native fantasy football app built as a senior capstone with Mindex. PM and frontend developer on a student team.",
		details: [
			"Coordinated bi-weekly sprints with a student team and a Mindex sponsor.",
			"Doubled sprint velocity by restructuring task breakdown and backlog prioritization.",
			"Refactored a messy legacy frontend and wrote a Go script to seed test users for stakeholder demos.",
		],
		tags: ["React Native", "Expo", "Go"],
		note: "repo private (NDA)",
	},
	{
		id: "prj-bird-scholar",
		name: "Bird Scholar",
		type: "PROJECT",
		rarity: "SSR",
		weight: 1,
		tagline: "Undergraduate research",
		description:
			"Research for WGST-225 examining citational bias in avian behavioral biology. Built citation network graphs from 105 papers using the Semantic Scholar API, NetworkX, and ForceAtlas2.",
		details: [
			"Found the same-sex behavior literature was notably less connected — the most-cited paper was a review calling for more data.",
		],
		tags: ["Python", "NetworkX", "ForceAtlas2"],
		links: [
			{
				label: "GITHUB ↗",
				href: "https://github.com/tristenkurutz/bird-scholar",
			},
			{
				label: "LIVE ↗",
				href: "https://tristenkurutz.github.io/bird-scholar",
			},
		],
	},
	{
		id: "exp-benco",
		name: "Benco Dental — FE Intern",
		type: "ROLE",
		rarity: "SSR",
		weight: 1,
		tagline: "Virtual · Jan 2026 – Jun 2026",
		description:
			"Contributing to full-stack applications with a C# (.NET) backend and React frontend as part of a cross-functional engineering team.",
		details: [
			"Designed and implemented unit tests using mock objects for reliability, coverage, and dependency isolation.",
			"Resolved frontend tickets for an e-commerce platform and internal apps — UI bugs, performance, edge cases.",
		],
		tags: ["C#", ".NET", "React"],
	},
	{
		id: "exp-isi",
		name: "Innovative Systems — FS Intern",
		type: "ROLE",
		rarity: "SSR",
		weight: 1,
		tagline: "Pittsburgh, PA · Sep 2025 – Dec 2025",
		description:
			"Extended existing full-stack applications by implementing features and fixes across C# (.NET) and React stacks.",
		details: [
			"Led a refactor initiative to improve maintainability and scalability through stronger object-oriented design patterns.",
			"Reduced React warning count from 250+ to zero, improving debugging efficiency and creating a cleaner CI/CD pipeline.",
		],
		tags: ["C#", ".NET", "React"],
	},
	// ---- SR (14%) ----
	{
		id: "exp-mt-fe-2025",
		name: "M&T Bank — FE Intern '25",
		type: "ROLE",
		rarity: "SR",
		weight: 1,
		tagline: "Buffalo, NY · Jun 2025 – Aug 2025",
		description:
			"Designed and prototyped comprehensive dashboards in Figma to improve the business workflow for viewing credit history disputes.",
		details: [
			"Implemented Angular services and components to streamline bank and 3rd-party REST API information in one location.",
			"Collaborated with business and technology stakeholders to deliver a user-focused application.",
		],
		tags: ["Angular", "Figma", "REST APIs"],
	},
	{
		id: "exp-casey",
		name: "Casey K. HQ — Web Dev",
		type: "ROLE",
		rarity: "SR",
		weight: 1,
		tagline: "Virtual · Aug 2024 – Jun 2025",
		description:
			"Ran a WordPress/WooCommerce site with Elementor and AutomatorWP automations.",
		tags: ["WordPress", "Elementor", "WooCommerce", "AutomatorWP"],
	},
	{
		id: "exp-mt-tech-2024",
		name: "M&T Bank — Tech Intern",
		type: "ROLE",
		rarity: "SR",
		weight: 1,
		tagline: "BUFFALO, NY — JUN 2024 → AUG 2024",
		description:
			"First industry placement at M&T Bank. Worked on CI/CD pipelines, artifact management, and security scanning.",
		tags: ["CI/CD", "Artifactory", "Security scanning"],
	},
	{
		id: "prj-website",
		name: "Personal website",
		type: "PROJECT",
		rarity: "SR",
		weight: 1,
		tagline: "Personal project",
		description:
			"The site you're playing right now. Built with TanStack Start (React), Convex, and Clerk — every pull is server-authoritative and progress saves to your account.",
		tags: ["TanStack Start", "React", "Convex", "Clerk"],
		links: [
			{
				label: "GITHUB ↗",
				href: "https://github.com/tristenkurutz/personal-website",
			},
		],
	},
	{
		id: "prj-bridge",
		name: "Slack–Discord bridge",
		type: "PROJECT",
		rarity: "SR",
		weight: 1,
		tagline: "Personal project",
		description:
			"Mirrors messages between a Slack channel and a Discord channel in both directions, in real time. Three parallel processes — Slack listener, Discord bot, Flask server — relay messages across platforms.",
		tags: ["Python", "Flask", "WebSockets"],
		links: [
			{
				label: "GITHUB ↗",
				href: "https://github.com/tristenkurutz/slack-discord-bridge",
			},
		],
	},
	{
		id: "skill-ts",
		name: "TypeScript",
		type: "SKILL",
		rarity: "R",
		weight: 1,
		tagline: "Language",
		description:
			"Daily driver across this site, React frontends, and Node tooling. Strict mode on, any castings shamed.",
		tags: ["LANGUAGE"],
	},
	{
		id: "skill-react",
		name: "React",
		type: "SKILL",
		rarity: "R",
		weight: 1,
		tagline: "Framework",
		description:
			"Primary frontend framework across three internships and every personal project since.",
		tags: ["FRAMEWORK"],
	},
	{
		id: "skill-csharp",
		name: "C#",
		type: "SKILL",
		rarity: "R",
		weight: 1,
		tagline: "Language",
		description:
			"Backend language of choice at Benco Dental and Innovative Systems. Strong OOP opinions formed here.",
		tags: ["LANGUAGE"],
	},
	{
		id: "skill-dotnet",
		name: ".NET",
		type: "SKILL",
		rarity: "R",
		weight: 1,
		tagline: "Runtime",
		description:
			"Two internships of full-stack work on .NET services paired with React frontends.",
		tags: ["RUNTIME"],
	},
	{
		id: "skill-java",
		name: "Java",
		type: "SKILL",
		rarity: "R",
		weight: 1,
		tagline: "Language",
		description:
			"Built an entire test orchestration platform solo in Java at M&T Bank. It holds.",
		tags: ["LANGUAGE"],
	},
	{
		id: "skill-python",
		name: "Python",
		type: "SKILL",
		rarity: "C",
		weight: 1,
		tagline: "Language",
		description:
			"Research scripts, citation network graphs, a Slack-Discord bridge. NetworkX is an old friend.",
		tags: ["LANGUAGE"],
	},
	{
		id: "skill-go",
		name: "Go",
		type: "SKILL",
		rarity: "SR",
		weight: 1,
		tagline: "Language",
		description:
			"Wrote automation scripts to seed test users and teams for stakeholder demos on the Mindex capstone.",
		tags: ["LANGUAGE"],
	},
	// ---- R (30%) ----
	{
		id: "skill-angular",
		name: "Angular",
		type: "SKILL",
		rarity: "SR",
		weight: 1,
		tagline: "Framework",
		description:
			"Frontend framework of the M&T '25 internship — services and components against REST APIs.",
		tags: ["FRAMEWORK"],
	},
	{
		id: "skill-spring",
		name: "Spring",
		type: "SKILL",
		rarity: "SR",
		weight: 1,
		tagline: "Framework",
		description: "Coursework and platform work in the Java ecosystem.",
		tags: ["FRAMEWORK"],
	},
	{
		id: "skill-postgresql",
		name: "PostgreSQL",
		type: "SKILL",
		rarity: "R",
		weight: 1,
		tagline: "Database",
		description: "The relational backbone behind coursework and side projects.",
		tags: ["DATABASE"],
	},
	{
		id: "skill-cpp",
		name: "C++",
		type: "SKILL",
		rarity: "R",
		weight: 1,
		tagline: "Language",
		description: "Systems programming coursework. Respects the footguns.",
		tags: ["LANGUAGE"],
	},
	{
		id: "skill-c",
		name: "C",
		type: "SKILL",
		rarity: "R",
		weight: 1,
		tagline: "Language",
		description: "Where the learning-curve scars come from.",
		tags: ["LANGUAGE"],
	},
	{
		id: "skill-js",
		name: "JavaScript",
		type: "SKILL",
		rarity: "C",
		weight: 1,
		tagline: "Language",
		description: "The language TypeScript keeps apologizing for.",
		tags: ["LANGUAGE"],
	},
	// ---- C (50%) ----
	{
		id: "skill-css",
		name: "CSS",
		type: "SKILL",
		rarity: "C",
		weight: 1,
		tagline: "Styling",
		description: "Neon glows, clip-paths, scanlines. You're looking at it.",
		tags: ["STYLING"],
	},
	{
		id: "skill-html",
		name: "HTML",
		type: "SKILL",
		rarity: "C",
		weight: 1,
		tagline: "Markup",
		description: "Semantic where it counts. Accessibility is not optional.",
		tags: ["MARKUP"],
	},
];

export const CARD_BY_ID = new Map(CARD_POOL.map((card) => [card.id, card]));
CARD_BY_ID.set(CHARACTER_CARD.id, CHARACTER_CARD);

export const ALL_CARDS = [CHARACTER_CARD, ...CARD_POOL];

export const PULLABLE_BY_RARITY: Record<Rarity, GachaCard[]> = {
	UR: CARD_POOL.filter((card) => card.rarity === "UR"),
	SSR: CARD_POOL.filter((card) => card.rarity === "SSR"),
	SR: CARD_POOL.filter((card) => card.rarity === "SR"),
	R: CARD_POOL.filter((card) => card.rarity === "R"),
	C: CARD_POOL.filter((card) => card.rarity === "C"),
};
