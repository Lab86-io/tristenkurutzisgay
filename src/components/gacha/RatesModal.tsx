import { ALL_CARDS, RARITY_META, RARITY_ORDER } from "#/data/cards";
import { PITY_SR, PITY_UR } from "#/lib/gacha";
import { Modal } from "./Modal";

export function RatesModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	return (
		<Modal open={open} onClose={onClose} label="Summon rates">
			<h3 className="modal-title">SUMMON RATES</h3>
			<p className="modal-sub">
				Every {PITY_SR} pulls guarantee SR or better. Pity for UR at {PITY_UR}{" "}
				pulls. Dupes refund credits automatically.
			</p>
			<table className="rates-table">
				<thead>
					<tr>
						<th scope="col">RARITY</th>
						<th scope="col">RATE</th>
						<th scope="col">CARDS</th>
						<th scope="col">DUPE REFUND</th>
					</tr>
				</thead>
				<tbody>
					{RARITY_ORDER.map((rarity) => (
						<tr key={rarity} data-rarity={rarity}>
							<td className="rates-rarity">{rarity}</td>
							<td>{(RARITY_META[rarity].rate * 100).toFixed(0)}%</td>
							<td>
								{ALL_CARDS.filter((card) => card.rarity === rarity).length}
							</td>
							<td>{RARITY_META[rarity].dupeRefund}◈</td>
						</tr>
					))}
				</tbody>
			</table>
			<p className="modal-foot">
				First summon is free and always decrypts the operator card. Trophies and
				collection milestones pay out bonus credits — check DOSSIER.
			</p>
		</Modal>
	);
}
