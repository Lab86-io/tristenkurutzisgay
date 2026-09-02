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
	x: number;
}

export function Clicker({ minedToday }: { minedToday: number }) {
	const mine = useMine();
	const [pending, setPending] = useState(0);
	const [floats, setFloats] = useState<FloatText[]>([]);
	const bankTimer = useRef<number | undefined>(undefined);
	const floatId = useRef(0);

	const remaining = Math.max(0, MINE_DAILY_CAP - minedToday - pending);
	const capped = remaining <= 0;

	useEffect(() => {
		return () => clearTimeout(bankTimer.current);
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
		const crit = Math.random() < MINE_CRIT_CHANCE;
		const gain = MINE_PER_CLICK + (crit ? MINE_CRIT_BONUS : 0);
		setPending((value) => value + gain);
		const id = floatId.current++;
		const rect = event.currentTarget.getBoundingClientRect();
		setFloats((list) => [
			...list.slice(-8),
			{
				id,
				value: crit ? `+${gain} CRIT` : `+${gain}`,
				crit,
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
				<h3 className="panel-title">CREDIT MINER</h3>
				<span className="mine-cap dim">
					{capped
						? "DAILY CAP REACHED"
						: `TODAY ${minedToday + pending}/${MINE_DAILY_CAP}`}
				</span>
			</div>
			<p className="mine-sub">
				Click to crack +{MINE_PER_CLICK}◈ off the ledger.{" "}
				{MINE_CRIT_CHANCE * 100}% chance of a +
				{MINE_PER_CLICK + MINE_CRIT_BONUS}◈ crit. Caps at {MINE_DAILY_CAP}◈/day
				— grind wisely.
			</p>
			<button
				type="button"
				className="mine-btn"
				onClick={onMine}
				disabled={capped}
				aria-label={`Mine credits, ${remaining} remaining today`}
			>
				<span className="mine-btn-icon" aria-hidden="true">
					⛏
				</span>
				<span className="mine-btn-label">{capped ? "DEPLETED" : "MINE"}</span>
				{pending > 0 && (
					<span className="mine-pending" aria-hidden="true">
						+{pending}◈ unbanked
					</span>
				)}
				{floats.map((f) => (
					<span
						key={f.id}
						className={`mine-float ${f.crit ? "mine-float-crit" : ""}`}
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
					BANK {pending}◈ NOW
				</button>
			)}
		</div>
	);
}
