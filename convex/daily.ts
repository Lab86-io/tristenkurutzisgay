/** daily decryption puzzles: answer stored plain, display text is Caesar-shifted */

export interface DailyPuzzle {
	answer: string;
	hint: string;
}

export const DAILY_PUZZLES: DailyPuzzle[] = [
	{ answer: "PLAYWRIGHT", hint: "The E2E test framework behind the 255 migrated tests" },
	{ answer: "ORCHESTRATION", hint: "What the solo-built Java platform does" },
	{ answer: "SPRINT", hint: "Doubled velocity by restructuring these" },
	{ answer: "ACCESSIBILITY", hint: "Non-negotiable in everything Tristen ships" },
	{ answer: "NETWORKX", hint: "Drew the citation graphs with it" },
	{ answer: "RIMWORLD", hint: "The colony sim habit that survives everything" },
	{ answer: "NETWORKING", hint: "Half of a Slack–Discord bridge's job" },
];

export function todayPuzzle(now = Date.now()): DailyPuzzle {
	const hour = Math.floor(now / 3_600_000);
	return DAILY_PUZZLES[hour % DAILY_PUZZLES.length];
}

export function caesar(text: string, shift: number): string {
	return text
		.toUpperCase()
		.replace(/[A-Z]/g, (char) =>
			String.fromCharCode(((char.charCodeAt(0) - 65 + shift + 26) % 26) + 65),
		);
}
