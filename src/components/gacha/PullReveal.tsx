import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { PullResult } from "#/lib/gacha";
import { gachaStore, TEN_PULL_COST } from "#/lib/gacha";
import { sfx } from "#/lib/sfx";
import { CardBack, GachaCardFace } from "./GachaCard";

const REVEAL_MS = 420;
const BIG_REVEAL_MS = 900;

export function PullReveal({
	results,
	onClose,
	onSummonAgain,
}: {
	results: PullResult[];
	onClose: () => void;
	onSummonAgain: (count: 1 | 10) => void;
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [revealed, setRevealed] = useState(0);
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
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (results.length && !dialog.open) dialog.showModal();
		if (!results.length && dialog.open) dialog.close();
		setRevealed(reducedMotion ? results.length : 0);
	}, [results, reducedMotion]);

	useEffect(() => {
		if (!results.length || revealed >= results.length) return;
		const next = results[revealed];
		if (revealed > 0 || results.length === 1) {
			if (
				next.card.rarity === "UR" ||
				next.card.rarity === "SSR" ||
				next.card.rarity === "SR"
			) {
				sfx.revealBig(next.card.rarity);
			} else {
				sfx.reveal();
			}
		}
		const delay =
			next.card.rarity === "UR" || next.card.rarity === "SSR"
				? BIG_REVEAL_MS
				: REVEAL_MS;
		const timer = window.setTimeout(
			() => setRevealed((count) => count + 1),
			delay,
		);
		return () => clearTimeout(timer);
	}, [results, revealed]);

	const done = revealed >= results.length;
	const credits = gachaStore.getSnapshot().credits;

	const skip = () => setRevealed(results.length);

	return (
		<dialog
			ref={dialogRef}
			className="pull-dialog"
			data-revealing={!done}
			onPointerDown={(event) => {
				if (event.target === dialogRef.current && !done) skip();
			}}
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
		>
			<div className="pull-stage" data-flash={revealed > 0 && !done}>
				<div className="pull-header">
					<h2 className="pull-title">
						{done
							? "SUMMON COMPLETE"
							: `DECRYPTING ${revealed + 1}/${results.length}`}
					</h2>
					{!done && (
						<button type="button" className="btn btn-ghost" onClick={skip}>
							SKIP ▸▸
						</button>
					)}
				</div>
				<div
					className={`pull-grid ${results.length === 1 ? "pull-grid-one" : ""}`}
				>
					{results.map((result) =>
						result.seq < revealed ? (
							<div
								key={result.seq}
								className={`pull-slot ${result.isDupe ? "pull-slot-dupe" : ""}`}
							>
								<GachaCardFace card={result.card} state="reveal" />
								{result.isDupe ? (
									<span className="pull-badge pull-badge-dupe">
										DUPE +{result.refund}◈
									</span>
								) : (
									<span className="pull-badge">NEW</span>
								)}
							</div>
						) : (
							<div key={result.seq} className="pull-slot" aria-hidden="true">
								<CardBack
									tell={
										result.card.rarity === "UR" || result.card.rarity === "SSR"
											? result.card.rarity
											: undefined
									}
								/>
							</div>
						),
					)}
				</div>
				{done && (
					<div className="pull-actions">
						<button
							type="button"
							className="btn btn-neon"
							disabled={credits < TEN_PULL_COST}
							onClick={() => onSummonAgain(10)}
						>
							SUMMON ×10 — {TEN_PULL_COST}◈
						</button>
						<button
							type="button"
							className="btn btn-ghost"
							onClick={() => onSummonAgain(1)}
						>
							SUMMON ×1
						</button>
						<Link to="/collection" className="btn btn-ghost" onClick={onClose}>
							DATABASE ▸
						</Link>
						<button type="button" className="btn btn-ghost" onClick={onClose}>
							CLOSE
						</button>
					</div>
				)}
			</div>
		</dialog>
	);
}
