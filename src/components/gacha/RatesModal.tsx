import { RARITY_META, RARITY_ORDER } from "#/data/cards";
import { useCards } from "#/hooks/useCards";
import { PITY_SR, PITY_UR } from "#/lib/gacha";
import { RarityOrbs } from "./GachaCard";
import { Modal } from "./Modal";

export function RatesModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const { cards } = useCards();
	return (
		<Modal open={open} onClose={onClose} label="Summon rates">
			<h3 className="modal-title">Summon rates</h3>
			<p className="modal-sub">
				Every {PITY_SR} pulls guarantee SR or better. Pity for UR at {PITY_UR}{" "}
				pulls. Dupes refund credits automatically.
			</p>
			<table className="rates-table">
				<thead>
					<tr>
						<th scope="col">Rarity</th>
						<th scope="col">Rate</th>
						<th scope="col">Cards</th>
						<th scope="col">Dupe refund</th>
					</tr>
				</thead>
				<tbody>
					{RARITY_ORDER.map((rarity) => (
						<tr key={rarity} data-rarity={rarity}>
							<td className="rates-rarity">
								<RarityOrbs rarity={rarity} size={9} />
							</td>
							<td>{(RARITY_META[rarity].rate * 100).toFixed(0)}%</td>
							<td>{cards.filter((card) => card.rarity === rarity).length}</td>
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
