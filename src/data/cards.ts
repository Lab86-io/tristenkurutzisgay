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
	UR: { label: "ULTRA RARE", rate: 0.01, dupeRefund: 500 },
	SSR: { label: "S-SPECIAL RARE", rate: 0.05, dupeRefund: 200 },
	SR: { label: "SUPER RARE", rate: 0.14, dupeRefund: 80 },
	R: { label: "RARE", rate: 0.3, dupeRefund: 40 },
	C: { label: "COMMON", rate: 0.5, dupeRefund: 20 },
};

export const CHARACTER_CARD: GachaCard = {
	id: "tk-character",
	name: "TRISTEN KURUTZ",
	type: "CHARACTER",
	rarity: "UR",
	weight: 0,
	tagline: "FULL-STACK ENGINEER // RIT '26",
	description:
		"Software engineering student at RIT graduating Dec 2026. Cares a lot about process and ethics in software — accessibility, maintainability, and security. Currently seeking full-time roles.",
	details: [
		"Built a Java test orchestration platform from the ground up as a solo project at M&T Bank.",
		"Led refactors, cut React warnings from 250+ to zero, and doubled a capstone team's sprint velocity.",
		"Outside the terminal: cat dad of two, amateur photographer, Rimworld addict, and dabbling in every craft available.",
	],
	tags: ["FULL-STACK", "TESTING/CI", "OOP", "PM"],
	stats: [
		{ label: "FULL-STACK", value: 88 },
		{ label: "TESTING / CI", value: 92 },
		{ label: "OOP DESIGN", value: 85 },
		{ label: "TEAM OPS", value: 80 },
		{ label: "ETHICS", value: 99 },
	],
};

export const CARD_POOL: GachaCard[] = [
	// ---- UR (1%) ----
	{
		id: "exp-mt-se-2026",
		name: "M&T BANK // SE INTERN",
		type: "ROLE",
		rarity: "UR",
		weight: 1,
		tagline: "BUFFALO, NY — JUN 2026 → AUG 2026",
		description:
			"Designed and built a Java-based test orchestration platform from the ground up as a solo project, replacing a legacy ReadyAPI setup.",
		details: [
			"Migrated 255 API and message queue tests to Playwright, improving maintainability and enabling programmatic test control.",
			"Integrated the platform into GitLab CI/CD pipelines to automate weekly test execution across deployment workflows.",
		],
		tags: ["JAVA", "PLAYWRIGHT", "GITLAB CI/CD"],
	},
	// ---- SSR (5%) ----
	{
		id: "prj-contrax",
		name: "CONTRAX",
		type: "PROJECT",
		rarity: "SSR",
		weight: 1,
		tagline: "SENIOR PROJECT // MINDEX SPONSORED",
		description:
			"React Native fantasy football app built as a senior capstone with Mindex. PM and frontend developer on a student team.",
		details: [
			"Coordinated bi-weekly sprints with a student team and a Mindex sponsor.",
			"Doubled sprint velocity by restructuring task breakdown and backlog prioritization.",
			"Refactored a messy legacy frontend and wrote a Go script to seed test users for stakeholder demos.",
		],
		tags: ["REACT NATIVE", "EXPO", "GO"],
		note: "repo private (NDA)",
	},
	{
		id: "prj-bird-scholar",
		name: "BIRD SCHOLAR",
		type: "PROJECT",
		rarity: "SSR",
		weight: 1,
		tagline: "UNDERGRADUATE RESEARCH",
		description:
			"Research for WGST-225 examining citational bias in avian behavioral biology. Built citation network graphs from 105 papers using the Semantic Scholar API, NetworkX, and ForceAtlas2.",
		details: [
			"Found the same-sex behavior literature was notably less connected — the most-cited paper was a review calling for more data.",
		],
		tags: ["PYTHON", "NETWORKX", "FORCEATLAS2"],
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
		name: "BENCO DENTAL // FE INTERN",
		type: "ROLE",
		rarity: "SSR",
		weight: 1,
		tagline: "VIRTUAL — JAN 2026 → JUN 2026",
		description:
			"Contributing to full-stack applications with a C# (.NET) backend and React frontend as part of a cross-functional engineering team.",
		details: [
			"Designed and implemented unit tests using mock objects for reliability, coverage, and dependency isolation.",
			"Resolved frontend tickets for an e-commerce platform and internal apps — UI bugs, performance, edge cases.",
		],
		tags: ["C#", ".NET", "REACT"],
	},
	{
		id: "exp-isi",
		name: "INNOVATIVE SYSTEMS // FS INTERN",
		type: "ROLE",
		rarity: "SSR",
		weight: 1,
		tagline: "PITTSBURGH, PA — SEP 2025 → DEC 2025",
		description:
			"Extended existing full-stack applications by implementing features and fixes across C# (.NET) and React stacks.",
		details: [
			"Led a refactor initiative to improve maintainability and scalability through stronger object-oriented design patterns.",
			"Reduced React warning count from 250+ to zero, improving debugging efficiency and creating a cleaner CI/CD pipeline.",
		],
		tags: ["C#", ".NET", "REACT"],
	},
	// ---- SR (14%) ----
	{
		id: "exp-mt-fe-2025",
		name: "M&T BANK // FE INTERN '25",
		type: "ROLE",
		rarity: "SR",
		weight: 1,
		tagline: "BUFFALO, NY — JUN 2025 → AUG 2025",
		description:
			"Designed and prototyped comprehensive dashboards in Figma to improve the business workflow for viewing credit history disputes.",
		details: [
			"Implemented Angular services and components to streamline bank and 3rd-party REST API information in one location.",
			"Collaborated with business and technology stakeholders to deliver a user-focused application.",
		],
		tags: ["ANGULAR", "FIGMA", "REST APIS"],
	},
	{
		id: "exp-casey",
		name: "CASEY K. HQ // WEB DEV",
		type: "ROLE",
		rarity: "SR",
		weight: 1,
		tagline: "VIRTUAL — AUG 2024 → JUN 2025",
		description:
			"Ran a WordPress/WooCommerce site with Elementor and AutomatorWP automations.",
		tags: ["WORDPRESS", "ELEMENTOR", "WOOCOMMERCE", "AUTOMATORWP"],
	},
	{
		id: "exp-mt-tech-2024",
		name: "M&T BANK // TECH INTERN",
		type: "ROLE",
		rarity: "SR",
		weight: 1,
		tagline: "BUFFALO, NY — JUN 2024 → AUG 2024",
		description:
			"First industry placement at M&T Bank. Worked on CI/CD pipelines, artifact management, and security scanning.",
		tags: ["CI/CD", "ARTIFACTORY", "SECURITY SCANNING"],
	},
	{
		id: "prj-website",
		name: "PERSONAL WEBSITE",
		type: "PROJECT",
		rarity: "SR",
		weight: 1,
		tagline: "PERSONAL PROJECT",
		description:
			"The site you're playing right now. Built with TanStack Start (React), Convex, and Clerk — every pull is server-authoritative and progress saves to your account.",
		tags: ["TANSTACK START", "REACT", "CONVEX", "CLERK"],
		links: [
			{
				label: "GITHUB ↗",
				href: "https://github.com/tristenkurutz/personal-website",
			},
		],
	},
	{
		id: "prj-bridge",
		name: "SLACK-DISCORD BRIDGE",
		type: "PROJECT",
		rarity: "SR",
		weight: 1,
		tagline: "PERSONAL PROJECT",
		description:
			"Mirrors messages between a Slack channel and a Discord channel in both directions, in real time. Three parallel processes — Slack listener, Discord bot, Flask server — relay messages across platforms.",
		tags: ["PYTHON", "FLASK", "WEBSOCKETS"],
		links: [
			{
				label: "GITHUB ↗",
				href: "https://github.com/tristenkurutz/slack-discord-bridge",
			},
		],
	},
	{
		id: "skill-ts",
		name: "TYPESCRIPT",
		type: "SKILL",
		rarity: "SR",
		weight: 1,
		tagline: "LANGUAGE",
		description:
			"Daily driver across this site, React frontends, and Node tooling. Strict mode on, any castings shamed.",
		tags: ["LANGUAGE"],
	},
	{
		id: "skill-react",
		name: "REACT",
		type: "SKILL",
		rarity: "R",
		weight: 1,
		tagline: "FRAMEWORK",
		description:
			"Primary frontend framework across three internships and every personal project since.",
		tags: ["FRAMEWORK"],
	},
	{
		id: "skill-csharp",
		name: "C#",
		type: "SKILL",
		rarity: "SR",
		weight: 1,
		tagline: "LANGUAGE",
		description:
			"Backend language of choice at Benco Dental and Innovative Systems. Strong OOP opinions formed here.",
		tags: ["LANGUAGE"],
	},
	{
		id: "skill-dotnet",
		name: ".NET",
		type: "SKILL",
		rarity: "SR",
		weight: 1,
		tagline: "RUNTIME",
		description:
			"Two internships of full-stack work on .NET services paired with React frontends.",
		tags: ["RUNTIME"],
	},
	{
		id: "skill-java",
		name: "JAVA",
		type: "SKILL",
		rarity: "SR",
		weight: 1,
		tagline: "LANGUAGE",
		description:
			"Built an entire test orchestration platform solo in Java at M&T Bank. It holds.",
		tags: ["LANGUAGE"],
	},
	{
		id: "skill-python",
		name: "PYTHON",
		type: "SKILL",
		rarity: "R",
		weight: 1,
		tagline: "LANGUAGE",
		description:
			"Research scripts, citation network graphs, a Slack-Discord bridge. NetworkX is an old friend.",
		tags: ["LANGUAGE"],
	},
	{
		id: "skill-go",
		name: "GO",
		type: "SKILL",
		rarity: "SSR",
		weight: 1,
		tagline: "LANGUAGE",
		description:
			"Wrote automation scripts to seed test users and teams for stakeholder demos on the Mindex capstone.",
		tags: ["LANGUAGE"],
	},
	// ---- R (30%) ----
	{
		id: "skill-angular",
		name: "ANGULAR",
		type: "SKILL",
		rarity: "SSR",
		weight: 1,
		tagline: "FRAMEWORK",
		description:
			"Frontend framework of the M&T '25 internship — services and components against REST APIs.",
		tags: ["FRAMEWORK"],
	},
	{
		id: "skill-spring",
		name: "SPRING",
		type: "SKILL",
		rarity: "SR",
		weight: 1,
		tagline: "FRAMEWORK",
		description: "Coursework and platform work in the Java ecosystem.",
		tags: ["FRAMEWORK"],
	},
	{
		id: "skill-postgresql",
		name: "POSTGRESQL",
		type: "SKILL",
		rarity: "R",
		weight: 1,
		tagline: "DATABASE",
		description: "The relational backbone behind coursework and side projects.",
		tags: ["DATABASE"],
	},
	{
		id: "skill-cpp",
		name: "C++",
		type: "SKILL",
		rarity: "R",
		weight: 1,
		tagline: "LANGUAGE",
		description: "Systems programming coursework. Respects the footguns.",
		tags: ["LANGUAGE"],
	},
	{
		id: "skill-c",
		name: "C",
		type: "SKILL",
		rarity: "R",
		weight: 1,
		tagline: "LANGUAGE",
		description: "Where the learning-curve scars come from.",
		tags: ["LANGUAGE"],
	},
	{
		id: "skill-js",
		name: "JAVASCRIPT",
		type: "SKILL",
		rarity: "C",
		weight: 1,
		tagline: "LANGUAGE",
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
		tagline: "STYLING",
		description: "Neon glows, clip-paths, scanlines. You're looking at it.",
		tags: ["STYLING"],
	},
	{
		id: "skill-html",
		name: "HTML",
		type: "SKILL",
		rarity: "C",
		weight: 1,
		tagline: "MARKUP",
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
