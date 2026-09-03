import { useEffect, useMemo, useState } from "react";
import { RECALL_MAX_MOVES, RECALL_PAIRS } from "#/lib/gacha";
import { Modal } from "./Modal";

interface Tile {
	id: number;
	pair: number;
	label: string;
}

function buildDeck(labels: string[]): Tile[] {
	const pairs = labels.slice(0, 6).flatMap((label, pair) => [
		{ pair, label },
		{ pair, label },
	]);
	for (let i = pairs.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[pairs[i], pairs[j]] = [pairs[j], pairs[i]];
	}
	return pairs.map((entry, index) => ({ id: index, ...entry }));
}

export function RecallGame({
	onComplete,
	onClose,
}: {
	onComplete: (moves: number) => Promise<boolean>;
	onClose: () => void;
}) {
	const labels = ["TK", "MT", "BS", "R", "TS", "GO"];
	const [deck] = useState<Tile[]>(() =>
		buildDeck(labels.slice(0, RECALL_PAIRS)),
	);
	const [flipped, setFlipped] = useState<number[]>([]);
	const [matched, setMatched] = useState<number[]>([]);
	const [moves, setMoves] = useState(0);
	const [claiming, setClaiming] = useState(false);

	const complete = matched.length === 6;

	useEffect(() => {
		if (!complete || claiming) return;
		setClaiming(true);
		onComplete(moves);
	}, [complete, claiming, moves, onComplete]);

	const flip = (tile: Tile) => {
		if (claiming || complete) return;
		if (matched.includes(tile.pair)) return;
		if (flipped.length === 2) return;
		if (flipped.includes(tile.id)) return;

		const next = [...flipped, tile.id];
		setFlipped(next);
		if (next.length === 2) {
			setMoves((value) => value + 1);
			const [firstId, secondId] = next;
			const first = deck.find((t) => t.id === firstId);
			const second = deck.find((t) => t.id === secondId);
			if (first && second && first.pair === second.pair) {
				setTimeout(() => {
					setMatched((pairs) => [...pairs, first.pair]);
					setFlipped([]);
				}, 450);
			} else {
				setTimeout(() => setFlipped([]), 800);
			}
		}
	};

	const grid = useMemo(() => deck, [deck]);

	return (
		<Modal open onClose={onClose} label="Recall test">
			<h3 className="modal-title">Recall test</h3>
			<p className="modal-sub">
				Match all six pairs. Moves: {moves} — {RECALL_MAX_MOVES} or fewer pays
				out.
			</p>
			<div className="recall-grid">
				{grid.map((tile) => {
					const isUp = flipped.includes(tile.id) || matched.includes(tile.pair);
					return (
						<button
							key={tile.id}
							type="button"
							className={`recall-tile ${isUp ? "recall-tile-up" : ""} ${
								matched.includes(tile.pair) ? "recall-tile-matched" : ""
							}`}
							onClick={() => flip(tile)}
							disabled={isUp}
						>
							{isUp ? tile.label : ""}
						</button>
					);
				})}
			</div>
			{complete && (
				<p className="daily-done">All pairs matched — payout secured.</p>
			)}
		</Modal>
	);
}
