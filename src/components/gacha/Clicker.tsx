import { useEffect, useRef, useState } from "react";
import { useMine } from "#/hooks/useGacha";
import {
	MINE_CRIT_BONUS,
	MINE_CRIT_CHANCE,
	MINE_DAILY_CAP,
	MINE_PER_CLICK,
} from "#/lib/gacha";
import { sfx } from "#/lib/sfx";

interface FloatText {
	id: number;
	value: string;
	crit: boolean;
	combo: boolean;
	x: number;
}

const COMBO_WINDOW_MS = 800;
const COMBO_MAX = 2;
const COMBO_STEP = 0.1;

export function Clicker({ minedToday }: { minedToday: number }) {
	const mine = useMine();
	const [pending, setPending] = useState(0);
	const [combo, setCombo] = useState(1);
	const [floats, setFloats] = useState<FloatText[]>([]);
	const bankTimer = useRef<number | undefined>(undefined);
	const comboTimer = useRef<number | undefined>(undefined);
	const floatId = useRef(0);

	const remaining = Math.max(0, MINE_DAILY_CAP - minedToday - pending);
	const capped = remaining <= 0;

	useEffect(() => {
		return () => {
			clearTimeout(bankTimer.current);
			clearTimeout(comboTimer.current);
		};
	}, []);

	const bank = async (amount: number) => {
		if (amount <= 0) return;
		setPending(0);
		const granted = await mine(amount);
		if (granted > 0) sfx.uplink();
	};

	const scheduleBank = () => {
		clearTimeout(bankTimer.current);
		bankTimer.current = window.setTimeout(() => {
			bank(pending);
		}, 1600);
	};

	const onMine = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (capped) return;

		// consecutive clicks inside the window build a combo multiplier
		const nextCombo = Math.min(COMBO_MAX, combo + COMBO_STEP);
		setCombo(nextCombo);
		clearTimeout(comboTimer.current);
		comboTimer.current = window.setTimeout(() => setCombo(1), COMBO_WINDOW_MS);

		const crit = Math.random() < MINE_CRIT_CHANCE;
		const base = MINE_PER_CLICK * (1 + nextCombo - 1);
		const gain = Math.max(1, Math.round(base)) + (crit ? MINE_CRIT_BONUS : 0);
		setPending((value) => value + gain);
		const id = floatId.current++;
		const rect = event.currentTarget.getBoundingClientRect();
		setFloats((list) => [
			...list.slice(-8),
			{
				id,
				value: crit
					? `+${gain} crit`
					: nextCombo >= COMBO_MAX
						? `+${gain} combo`
						: `+${gain}`,
				crit,
				combo: !crit && nextCombo >= COMBO_MAX,
				x: ((event.clientX - rect.left) / rect.width) * 100,
			},
		]);
		window.setTimeout(() => {
			setFloats((list) => list.filter((f) => f.id !== id));
		}, 900);
		crit ? sfx.revealBig("SR") : sfx.tick();
		scheduleBank();
	};

	return (
		<div className="mine-panel">
			<div className="mine-head">
				<h3 className="panel-title">Credit miner</h3>
				<span className="mine-cap dim">
					{capped
						? "Daily cap reached"
						: `Today ${minedToday + pending}/${MINE_DAILY_CAP}`}
				</span>
			</div>
			<p className="mine-sub">
				Click to crack +{MINE_PER_CLICK}◈ off the ledger. Chain clicks within{" "}
				{COMBO_WINDOW_MS / 1000}s to build a combo up to ×{COMBO_MAX}.{" "}
				{Math.round(MINE_CRIT_CHANCE * 100)}% chance of a +{MINE_CRIT_BONUS}◈
				crit. Caps at {MINE_DAILY_CAP}◈/day.
			</p>
			<button
				type="button"
				className={`mine-btn ${combo > 1.5 ? "mine-btn-hot" : ""}`}
				onClick={onMine}
				disabled={capped}
				aria-label={`Mine credits, ${remaining} remaining today`}
			>
				<span className="mine-btn-icon" aria-hidden="true">
					◈
				</span>
				<span className="mine-btn-label">{capped ? "Depleted" : "Mine"}</span>
				{combo > 1 && (
					<span className="mine-combo" aria-hidden="true">
						×{combo.toFixed(1)}
					</span>
				)}
				{pending > 0 && (
					<span className="mine-pending" aria-hidden="true">
						+{pending}◈ unbanked
					</span>
				)}
				{floats.map((f) => (
					<span
						key={f.id}
						className={`mine-float ${f.crit ? "mine-float-crit" : ""} ${f.combo ? "mine-float-combo" : ""}`}
						style={{ left: `${f.x}%` }}
						aria-hidden="true"
					>
						{f.value}
					</span>
				))}
			</button>
			{pending >= 10 && (
				<button
					type="button"
					className="btn btn-ghost mine-bank"
					onClick={() => {
						clearTimeout(bankTimer.current);
						bank(pending);
					}}
				>
					Bank {pending}◈ now
				</button>
			)}
		</div>
	);
}
