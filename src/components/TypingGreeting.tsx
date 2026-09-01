import { useEffect, useState } from "react";

const PHRASES = ["Hey!", "I'm Tristen.", "RIT '26."];
const TYPE_MS = 90;
const ERASE_MS = 45;
const HOLD_MS = 2200;
const PAUSE_MS = 300;

type Phase = "typing" | "erasing";

export function TypingGreeting() {
	const [text, setText] = useState("");
	const [phraseIndex, setPhraseIndex] = useState(0);
	const [phase, setPhase] = useState<Phase>("typing");
	const [reducedMotion, setReducedMotion] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReducedMotion(mq.matches);
		const onChange = (event: MediaQueryListEvent) =>
			setReducedMotion(event.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	useEffect(() => {
		if (reducedMotion) return;
		const phrase = PHRASES[phraseIndex];
		let timer: number | undefined;
		if (phase === "typing") {
			if (text.length < phrase.length) {
				timer = window.setTimeout(
					() => setText(phrase.slice(0, text.length + 1)),
					TYPE_MS,
				);
			} else {
				timer = window.setTimeout(
					() => setPhase("erasing"),
					text === PHRASES[0] ? HOLD_MS + HOLD_MS : HOLD_MS,
				);
			}
		} else if (text.length > 0) {
			timer = window.setTimeout(
				() => setText(phrase.slice(0, text.length - 1)),
				ERASE_MS,
			);
		} else {
			timer = window.setTimeout(() => {
				setPhraseIndex((i) => (i + 1) % PHRASES.length);
				setPhase("typing");
			}, PAUSE_MS);
		}
		return () => clearTimeout(timer);
	}, [text, phase, phraseIndex, reducedMotion]);

	if (reducedMotion) {
		return <span className="typing-line">{PHRASES[0]}</span>;
	}

	return (
		<span className="typing-line" aria-hidden="true">
			<span
				className="typing-text"
				style={{ width: `${Math.max(text.length, 1)}ch` }}
			>
				{text}
			</span>
		</span>
	);
}
