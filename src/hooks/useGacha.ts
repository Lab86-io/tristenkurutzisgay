import { useEffect, useSyncExternalStore } from "react";
import { type GachaState, gachaStore, type PullResult } from "#/lib/gacha";

export function useGacha(): GachaState {
	useEffect(() => {
		gachaStore.hydrate();
	}, []);
	return useSyncExternalStore(
		gachaStore.subscribe,
		gachaStore.getSnapshot,
		gachaStore.getServerSnapshot,
	);
}

export function summon(count: 1 | 10): PullResult[] | null {
	return gachaStore.summon(count);
}

export function claimStipend(): boolean {
	return gachaStore.claimStipend();
}

export function stipendAvailable(): boolean {
	return gachaStore.stipendAvailable();
}

export function resetSave(): void {
	gachaStore.reset();
}
