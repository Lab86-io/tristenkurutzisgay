import { useSyncExternalStore } from "react";

export type ToastTone = "cyan" | "gold" | "magenta" | "green";

export interface Toast {
	id: number;
	title: string;
	body?: string;
	tone: ToastTone;
}

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
	for (const listener of listeners) listener();
}

export const toastStore = {
	subscribe(listener: () => void) {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	},
	getSnapshot(): Toast[] {
		return toasts;
	},
	getServerSnapshot(): Toast[] {
		return [];
	},
	dismiss(id: number) {
		toasts = toasts.filter((toast) => toast.id !== id);
		emit();
	},
};

export function pushToast(
	title: string,
	body?: string,
	tone: ToastTone = "cyan",
): void {
	const toast: Toast = { id: nextId++, title, body, tone };
	toasts = [...toasts, toast];
	emit();
	const id = toast.id;
	setTimeout(() => toastStore.dismiss(id), 4200);
}

export function useToasts(): Toast[] {
	return useSyncExternalStore(
		toastStore.subscribe,
		toastStore.getSnapshot,
		toastStore.getServerSnapshot,
	);
}
