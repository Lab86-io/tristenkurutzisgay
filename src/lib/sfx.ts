let ctx: AudioContext | null = null;
let muted = false;

function loadMuted(): boolean {
	if (typeof window === "undefined") return false;
	try {
		return window.localStorage.getItem("tk-gacha-muted") === "true";
	} catch {
		return false;
	}
}

if (typeof window !== "undefined") {
	muted = loadMuted();
}

function ensureCtx(): AudioContext | null {
	if (typeof window === "undefined" || muted) return null;
	if (!ctx) {
		const AC =
			window.AudioContext ??
			(window as unknown as { webkitAudioContext?: typeof AudioContext })
				.webkitAudioContext;
		if (!AC) return null;
		ctx = new AC();
	}
	if (ctx.state === "suspended") void ctx.resume();
	return ctx;
}

interface ToneOptions {
	freq: number;
	duration: number;
	type?: OscillatorType;
	gain?: number;
	delay?: number;
	slideTo?: number;
}

function tone({
	freq,
	duration,
	type = "square",
	gain = 0.05,
	delay = 0,
	slideTo,
}: ToneOptions): void {
	const audio = ensureCtx();
	if (!audio) return;
	const start = audio.currentTime + delay;
	const end = start + duration;
	const osc = audio.createOscillator();
	const amp = audio.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, start);
	if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, end);
	amp.gain.setValueAtTime(0, start);
	amp.gain.linearRampToValueAtTime(gain, start + 0.008);
	amp.gain.exponentialRampToValueAtTime(0.0001, end);
	osc.connect(amp).connect(audio.destination);
	osc.start(start);
	osc.stop(end);
}

export const sfx = {
	isMuted(): boolean {
		return muted;
	},
	toggleMute(): boolean {
		muted = !muted;
		try {
			window.localStorage.setItem("tk-gacha-muted", String(muted));
		} catch {
			// storage blocked; session-only preference
		}
		if (!muted) tone({ freq: 880, duration: 0.07, gain: 0.06 });
		return muted;
	},
	click(): void {
		tone({ freq: 620, duration: 0.05, gain: 0.04 });
	},
	deny(): void {
		tone({ freq: 180, duration: 0.12, type: "sawtooth", gain: 0.05 });
	},
	tick(): void {
		tone({ freq: 740, duration: 0.05, gain: 0.045 });
	},
	reveal(): void {
		tone({ freq: 520, duration: 0.09, type: "triangle", gain: 0.05 });
	},
	revealBig(rarity: "SR" | "SSR" | "UR"): void {
		if (rarity === "SR") {
			tone({ freq: 440, duration: 0.12, type: "triangle", gain: 0.07 });
			tone({
				freq: 660,
				duration: 0.16,
				type: "triangle",
				gain: 0.07,
				delay: 0.09,
			});
		} else if (rarity === "SSR") {
			tone({ freq: 523, duration: 0.14, type: "triangle", gain: 0.08 });
			tone({
				freq: 659,
				duration: 0.14,
				type: "triangle",
				gain: 0.08,
				delay: 0.11,
			});
			tone({
				freq: 784,
				duration: 0.22,
				type: "triangle",
				gain: 0.08,
				delay: 0.22,
			});
		} else {
			tone({ freq: 523, duration: 0.16, type: "triangle", gain: 0.09 });
			tone({
				freq: 784,
				duration: 0.16,
				type: "triangle",
				gain: 0.09,
				delay: 0.13,
			});
			tone({
				freq: 1046,
				duration: 0.34,
				type: "triangle",
				gain: 0.09,
				delay: 0.26,
			});
			tone({
				freq: 1568,
				duration: 0.4,
				type: "sine",
				gain: 0.06,
				delay: 0.26,
			});
		}
	},
	uplink(): void {
		tone({ freq: 660, duration: 0.09, type: "sine", gain: 0.07 });
		tone({ freq: 990, duration: 0.14, type: "sine", gain: 0.07, delay: 0.09 });
	},
	unlock(): void {
		tone({ freq: 587, duration: 0.1, type: "square", gain: 0.05 });
		tone({ freq: 880, duration: 0.2, type: "square", gain: 0.05, delay: 0.1 });
	},
};
