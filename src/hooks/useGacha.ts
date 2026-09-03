import { useAuth } from "@clerk/tanstack-react-start";
import { useMutation, useQuery } from "convex/react";
import { CARD_BY_ID, type GachaCard } from "#/data/cards";
import {
	defaultGachaState,
	type GachaState,
	type UnlockedAchievement,
} from "#/lib/gacha";
import { sfx } from "#/lib/sfx";
import { pushToast } from "#/lib/toasts";
import { api } from "../../convex/_generated/api";

export type SessionStatus = "loading" | "signed-out" | "ready";

export interface RevealCard {
	seq: number;
	card: GachaCard;
	isDupe: boolean;
	refund: number;
}

export interface SummonOutcome {
	results: RevealCard[];
	unlocked: UnlockedAchievement[];
}

export function useGachaSession(): {
	status: SessionStatus;
	state: GachaState;
} {
	const { isLoaded, isSignedIn } = useAuth();
	const raw = useQuery(
		api.players.getState,
		isLoaded && isSignedIn ? {} : "skip",
	);

	if (!isLoaded || (isSignedIn && raw === undefined)) {
		return { status: "loading", state: defaultGachaState() };
	}
	if (!isSignedIn) {
		return { status: "signed-out", state: defaultGachaState() };
	}
	return { status: "ready", state: raw ?? defaultGachaState() };
}

function announceUnlocks(unlocked: UnlockedAchievement[]): void {
	for (const achievement of unlocked) {
		pushToast(
			`TROPHY — ${achievement.name}`,
			`${achievement.description} +${achievement.reward}◈`,
			"gold",
		);
	}
	if (unlocked.length) sfx.unlock();
}

export function useSummon(): (count: 1 | 10) => Promise<SummonOutcome | null> {
	const summonMutation = useMutation(api.players.summon);
	return async (count) => {
		try {
			const response = await summonMutation({ count });
			announceUnlocks(response.unlocked);
			return {
				results: response.results.flatMap((result) => {
					const card = CARD_BY_ID.get(result.cardId);
					if (!card) return [];
					return [
						{
							seq: result.seq,
							card,
							isDupe: result.isDupe,
							refund: result.refund,
						},
					];
				}),
				unlocked: response.unlocked,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "";
			if (message.includes("INSUFFICIENT_CREDITS")) {
				pushToast("INSUFFICIENT CREDITS", "Claim the daily UPLINK.", "magenta");
			} else if (message.includes("SIGN_IN_REQUIRED")) {
				pushToast("SIGN IN REQUIRED", "Sign in to summon.", "magenta");
			} else {
				pushToast("SUMMON FAILED", "Try again.", "magenta");
			}
			return null;
		}
	};
}

export function useClaimStipend(): () => Promise<void> {
	const claimMutation = useMutation(api.players.claimStipend);
	return async () => {
		try {
			const response = await claimMutation({});
			if (response.claimed) {
				sfx.uplink();
				pushToast(
					"UPLINK CLAIMED",
					`+600◈ — STREAK ×${response.state.streak}`,
					"green",
				);
				announceUnlocks(response.unlocked);
			}
		} catch {
			pushToast("UPLINK FAILED", "Sign in first.", "magenta");
		}
	};
}

export function useResetSave(): () => Promise<void> {
	const resetMutation = useMutation(api.players.resetSave);
	return async () => {
		try {
			await resetMutation({});
			pushToast("SAVE WIPED", "Fresh operator record created.", "cyan");
		} catch {
			pushToast("RESET FAILED", "Sign in first.", "magenta");
		}
	};
}

export function useMine(): (amount: number) => Promise<number> {
	const mineMutation = useMutation(api.players.mine);
	return async (amount) => {
		try {
			const response = await mineMutation({ amount });
			return response.granted;
		} catch {
			return 0;
		}
	};
}

export function useSendMessage(): (
	name: string,
	email: string,
	message: string,
) => Promise<boolean> {
	const sendMutation = useMutation(api.players.sendMessage);
	return async (name, email, message) => {
		try {
			const response = await sendMutation({ name, email, message });
			if (response.rewardGranted) {
				pushToast(
					"FIRST TRANSMISSION",
					`Message delivered — +${response.reward}◈`,
					"gold",
				);
				sfx.unlock();
			} else {
				pushToast("TRANSMISSION SENT", "Message delivered.", "green");
			}
			return true;
		} catch {
			pushToast(
				"TRANSMISSION FAILED",
				"Check the fields — message needs 10+ characters.",
				"magenta",
			);
			return false;
		}
	};
}

export function useSubmitExam(): (
	answers: number[],
) => Promise<{ passed: boolean; unlocked: UnlockedAchievement[] }> {
	const examMutation = useMutation(api.players.submitExam);
	return async (answers) => {
		try {
			const response = await examMutation({ answers });
			return { passed: response.passed, unlocked: response.unlocked };
		} catch {
			pushToast("EXAM ERROR", "Sign in first.", "magenta");
			return { passed: false, unlocked: [] };
		}
	};
}

export function useDailyState() {
	const { isLoaded, isSignedIn } = useAuth();
	return useQuery(
		api.players.getDailyState,
		isLoaded && isSignedIn ? {} : "skip",
	);
}

export function useSolveCipher(): (
	answer: string,
) => Promise<{ solved: boolean; reason?: string }> {
	const solveMutation = useMutation(api.players.solveCipher);
	return async (answer) => {
		try {
			const response = await solveMutation({ answer });
			return { solved: response.solved, reason: response.reason };
		} catch {
			return { solved: false, reason: "error" };
		}
	};
}

export function useClaimRecall(): (moves: number) => Promise<boolean> {
	const recallMutation = useMutation(api.players.claimRecall);
	return async (moves) => {
		try {
			const response = await recallMutation({ moves });
			if (response.claimed) {
				pushToast(
					"RECALL COMPLETE",
					`Memory intact — +${response.reward}◈`,
					"gold",
				);
				sfx.unlock();
				return true;
			}
			return false;
		} catch {
			pushToast("RECALL FAILED", "Try again tomorrow.", "magenta");
			return false;
		}
	};
}

export function useClaimScan(): (page: string) => Promise<number> {
	const scanMutation = useMutation(api.players.claimScan);
	return async (page) => {
		try {
			const response = await scanMutation({ page });
			if (response.granted > 0) {
				pushToast(
					"SCANNER",
					`+${response.granted}◈ — ${response.scanned}/3 pages explored today`,
					"cyan",
				);
			}
			return response.granted;
		} catch {
			return 0;
		}
	};
}
