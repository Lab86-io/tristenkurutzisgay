import { useState } from "react";
import {
	useClaimRecall,
	useDailyState,
	useSolveCipher,
} from "#/hooks/useGacha";
import {
	CIPHER_REWARD,
	RECALL_MAX_MOVES,
	RECALL_REWARD,
	SCAN_MAX,
} from "#/lib/gacha";
import { RecallGame } from "./RecallGame";

export function DailyOps() {
	const daily = useDailyState();
	const solveCipher = useSolveCipher();
	const claimRecall = useClaimRecall();
	const [answer, setAnswer] = useState("");
	const [cipherError, setCipherError] = useState(false);
	const [recallOpen, setRecallOpen] = useState(false);

	if (!daily || daily.signedIn === false) return null;

	const submitCipher = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const result = await solveCipher(answer);
		if (result.solved) {
			setAnswer("");
			setCipherError(false);
			return;
		}
		setCipherError(result.reason === "wrong");
	};

	return (
		<div className="daily-ops">
			<div className="daily-head">
				<h3 className="panel-title">Hourly ops</h3>
				<span className="dim daily-note">resets every hour</span>
			</div>

			{/* cipher */}
			<div className="daily-op" data-done={daily.cipherDone}>
				<div className="daily-op-head">
					<span className="daily-op-name">Caesar-3 cipher</span>
					<span className="daily-op-reward">+{CIPHER_REWARD}◈</span>
				</div>
				{daily.cipherDone ? (
					<p className="daily-done">Solved today — come back tomorrow.</p>
				) : (
					<>
						<p className="daily-hint">
							Decode: <span className="cipher-text">{daily.cipherText}</span>
						</p>
						<p className="daily-hint dim">Hint: {daily.hint}</p>
						<form className="daily-cipher-form" onSubmit={submitCipher}>
							<input
								className="transmit-input"
								value={answer}
								placeholder="Your answer"
								onChange={(event) => {
									setAnswer(event.target.value);
									setCipherError(false);
								}}
							/>
							<button
								type="submit"
								className="btn btn-ghost"
								disabled={!answer.trim()}
							>
								Submit
							</button>
						</form>
						{cipherError && (
							<p className="exam-failed">Wrong. The cipher laughs.</p>
						)}
					</>
				)}
			</div>

			{/* recall */}
			<div className="daily-op" data-done={daily.recallDone}>
				<div className="daily-op-head">
					<span className="daily-op-name">Recall test</span>
					<span className="daily-op-reward">+{RECALL_REWARD}◈</span>
				</div>
				{daily.recallDone ? (
					<p className="daily-done">Memory proven today.</p>
				) : (
					<>
						<p className="daily-hint">
							Match all pairs in {RECALL_MAX_MOVES} moves or fewer.
						</p>
						<button
							type="button"
							className="btn btn-ghost"
							onClick={() => setRecallOpen(true)}
						>
							Start recall
						</button>
					</>
				)}
			</div>

			{/* scanner */}
			<div className="daily-op" data-done={daily.scanned.length >= SCAN_MAX}>
				<div className="daily-op-head">
					<span className="daily-op-name">Site scanner</span>
					<span className="daily-op-reward">
						{daily.scanned.length}/{SCAN_MAX}
					</span>
				</div>
				<p className="daily-hint">
					Visit each section of the site — the scanner pays as you explore.
				</p>
				<div className="scan-pips">
					{["/", "/collection", "/comms"].map((page) => (
						<span
							key={page}
							className={`scan-pip ${daily.scanned.includes(page) ? "scan-pip-on" : ""}`}
						>
							{page === "/" ? "summon" : page.slice(1)}
						</span>
					))}
				</div>
			</div>

			{recallOpen && (
				<RecallGame
					onComplete={async (moves) => {
						const claimed = await claimRecall(moves);
						setRecallOpen(false);
						return claimed;
					}}
					onClose={() => setRecallOpen(false)}
				/>
			)}
		</div>
	);
}
