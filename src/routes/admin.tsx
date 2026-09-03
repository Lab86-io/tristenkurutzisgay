import { SignInButton, useUser } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { RarityOrbs } from "#/components/gacha/GachaCard";
import { type GachaCard, RARITY_ORDER, type Rarity } from "#/data/cards";
import { useCards } from "#/hooks/useCards";
import { pushToast } from "#/lib/toasts";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/admin")({
	head: () => ({
		meta: [{ title: "Admin — Tristen Kurutz" }],
	}),
	component: AdminPage,
});

const OWNER_EMAILS = (
	import.meta.env.VITE_OWNER_EMAILS ?? "tristenkurutz@gmail.com"
)
	.split(",")
	.map((email: string) => email.trim().toLowerCase());

interface CardDraft {
	id: string;
	name: string;
	type: GachaCard["type"];
	rarity: Rarity;
	weight: number;
	active: boolean;
	tagline: string;
	description: string;
	details: string;
	tags: string;
	links: string;
	note: string;
}

function toDraft(card: GachaCard): CardDraft {
	return {
		id: card.id,
		name: card.name,
		type: card.type,
		rarity: card.rarity,
		weight: card.weight,
		active: card.active ?? true,
		tagline: card.tagline,
		description: card.description,
		details: (card.details ?? []).join("\n"),
		tags: (card.tags ?? []).join(", "),
		links: (card.links ?? [])
			.map((link) => `${link.label} | ${link.href}`)
			.join("\n"),
		note: card.note ?? "",
	};
}

function parseLinks(raw: string) {
	return raw
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const [label, href] = line.split("|").map((part) => part.trim());
			return { label: label ?? "LINK", href: href ?? line };
		});
}

function AdminPage() {
	const { isLoaded, isSignedIn, user } = useUser();
	const { cards } = useCards();
	const [drafts, setDrafts] = useState<Record<string, CardDraft>>({});
	const [saving, setSaving] = useState<string | null>(null);
	const [newCard, setNewCard] = useState<CardDraft | null>(null);
	const upsert = useMutation(api.cards.upsertCard);
	const removeCard = useMutation(api.cards.deleteCard);

	const email = user?.primaryEmailAddress?.emailAddress ?? "";
	const isOwner = OWNER_EMAILS.includes(email.toLowerCase());

	const messages = useQuery(
		api.players.listMessages,
		isLoaded && isSignedIn && isOwner ? {} : "skip",
	);

	if (!isLoaded) {
		return (
			<div className="admin-page">
				<p className="section-sub">Connecting…</p>
			</div>
		);
	}

	if (!isSignedIn) {
		return (
			<div className="admin-page">
				<h1 className="page-title font-myfont">Admin</h1>
				<p className="section-sub">
					<SignInButton mode="modal">
						<button type="button" className="linklike neon-link">
							Sign in
						</button>
					</SignInButton>{" "}
					as the owner to manage cards and read transmissions.
				</p>
			</div>
		);
	}

	if (!isOwner) {
		return (
			<div className="admin-page">
				<h1 className="page-title font-myfont">Access restricted</h1>
				<p className="section-sub">
					Signed in as {email}. This console belongs to the operator.
				</p>
			</div>
		);
	}

	const draftFor = (card: GachaCard): CardDraft =>
		drafts[card.id] ?? toDraft(card);

	const patch = (id: string, part: Partial<CardDraft>) => {
		const card = cards.find((entry) => entry.id === id);
		if (!card) return;
		setDrafts((prev) => ({
			...prev,
			[id]: { ...toDraft(card), ...prev[id], ...part },
		}));
	};

	const save = async (draft: CardDraft) => {
		setSaving(draft.id);
		try {
			await upsert({
				card: {
					id: draft.id.trim(),
					name: draft.name.trim() || draft.id,
					type: draft.type,
					rarity: draft.rarity,
					weight: Number(draft.weight) || 1,
					active: draft.active,
					tagline: draft.tagline,
					description: draft.description,
					details: draft.details
						.split("\n")
						.map((line) => line.trim())
						.filter(Boolean),
					tags: draft.tags
						.split(",")
						.map((tag) => tag.trim().toUpperCase())
						.filter(Boolean),
					links: parseLinks(draft.links),
					note: draft.note.trim() || undefined,
				},
			});
			pushToast("Card saved", draft.id, "green");
		} catch (error) {
			pushToast(
				"Save failed",
				error instanceof Error ? error.message : "",
				"magenta",
			);
		}
		setSaving(null);
	};

	const remove = async (id: string) => {
		if (!window.confirm(`Delete ${id}? Players who own it keep it.`)) return;
		try {
			await removeCard({ id });
			pushToast("Card deleted", id, "magenta");
		} catch (error) {
			pushToast(
				"Delete failed",
				error instanceof Error ? error.message : "",
				"magenta",
			);
		}
	};

	const newCardForm = newCard ? (
		<section className="panel admin-new">
			<h2 className="panel-title">New card</h2>
			<CardEditor
				draft={newCard}
				onChange={(part) =>
					setNewCard((prev) => (prev ? { ...prev, ...part } : prev))
				}
				onSave={async () => {
					await save(newCard);
					setNewCard(null);
				}}
				saving={saving === "new"}
			/>
		</section>
	) : (
		<button
			type="button"
			className="btn btn-ghost"
			onClick={() =>
				setNewCard({
					id: "",
					name: "",
					type: "SKILL",
					rarity: "C",
					weight: 1,
					active: true,
					tagline: "",
					description: "",
					details: "",
					tags: "",
					links: "",
					note: "",
				})
			}
		>
			+ New card
		</button>
	);

	return (
		<div className="admin-page">
			<h1 className="page-title font-myfont">Card admin</h1>
			<p className="section-sub">
				{cards.length} records live in Convex. Edits apply to every future
				summon instantly.
			</p>

			{newCardForm}

			<div className="admin-list">
				{cards.map((card) => {
					const draft = draftFor(card);
					const dirty = Boolean(drafts[card.id]);
					return (
						<section key={card.id} className="panel admin-card">
							<div className="admin-card-head">
								<RarityOrbs rarity={draft.rarity} size={9} />
								<span className="admin-card-id">{card.id}</span>
								{dirty && <span className="admin-dirty">Unsaved</span>}
								<span className="admin-card-actions">
									<button
										type="button"
										className="btn btn-ghost"
										disabled={saving === card.id}
										onClick={() => save(draft)}
									>
										{saving === card.id ? "Saving…" : "Save"}
									</button>
									{card.id !== "tk-character" && (
										<button
											type="button"
											className="btn btn-ghost admin-delete"
											onClick={() => remove(card.id)}
										>
											DELETE
										</button>
									)}
								</span>
							</div>
							<CardEditor
								draft={draft}
								onChange={(part) => patch(card.id, part)}
								onSave={undefined}
								onDelete={undefined}
								saving={false}
							/>
						</section>
					);
				})}
			</div>

			<section className="panel admin-inbox">
				<h2 className="panel-title">Transmissions</h2>
				{messages === undefined ? (
					<p className="transmit-sub">Loading…</p>
				) : messages.length === 0 ? (
					<p className="transmit-sub">No transmissions yet.</p>
				) : (
					<ul className="admin-messages">
						{messages.map((message) => (
							<li key={message._id} className="admin-message">
								<span className="admin-message-head">
									{message.name} · {message.email}
									{message.rewardGranted ? " · rewarded" : ""}
									{" · "}
									{new Date(message.createdAt).toLocaleString()}
								</span>
								<span className="admin-message-body">{message.message}</span>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}

function CardEditor({
	draft,
	onChange,
	onSave,
	onDelete,
	saving,
}: {
	draft: CardDraft;
	onChange: (part: Partial<CardDraft>) => void;
	onSave?: (() => void) | undefined;
	onDelete?: (() => void) | undefined;
	saving: boolean;
}) {
	return (
		<div className="admin-editor">
			<div className="admin-grid">
				<label className="admin-field">
					<span>ID</span>
					<input
						className="transmit-input"
						value={draft.id}
						disabled={Boolean(onSave) === false && !draft.id.startsWith("new")}
						onChange={(event) => onChange({ id: event.target.value })}
					/>
				</label>
				<label className="admin-field">
					<span>NAME</span>
					<input
						className="transmit-input"
						value={draft.name}
						onChange={(event) => onChange({ name: event.target.value })}
					/>
				</label>
				<label className="admin-field">
					<span>TYPE</span>
					<select
						className="transmit-input"
						value={draft.type}
						onChange={(event) =>
							onChange({ type: event.target.value as CardDraft["type"] })
						}
					>
						{["SKILL", "ROLE", "PROJECT", "CHARACTER"].map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</label>
				<label className="admin-field">
					<span>RARITY</span>
					<select
						className="transmit-input"
						value={draft.rarity}
						onChange={(event) =>
							onChange({ rarity: event.target.value as Rarity })
						}
					>
						{RARITY_ORDER.map((rarity) => (
							<option key={rarity} value={rarity}>
								{rarity}
							</option>
						))}
					</select>
				</label>
				<label className="admin-field">
					<span>WEIGHT</span>
					<input
						className="transmit-input"
						type="number"
						min={0}
						max={100}
						value={draft.weight}
						onChange={(event) =>
							onChange({ weight: Number(event.target.value) })
						}
					/>
				</label>
				<label className="admin-field admin-checkbox">
					<input
						type="checkbox"
						checked={draft.active}
						onChange={(event) => onChange({ active: event.target.checked })}
					/>
					<span>ACTIVE (in pull pool)</span>
				</label>
			</div>
			<label className="admin-field">
				<span>TAGLINE</span>
				<input
					className="transmit-input"
					value={draft.tagline}
					onChange={(event) => onChange({ tagline: event.target.value })}
				/>
			</label>
			<label className="admin-field">
				<span>DESCRIPTION</span>
				<textarea
					className="transmit-input transmit-textarea"
					rows={2}
					value={draft.description}
					onChange={(event) => onChange({ description: event.target.value })}
				/>
			</label>
			<label className="admin-field">
				<span>DETAILS (one per line)</span>
				<textarea
					className="transmit-input transmit-textarea"
					rows={3}
					value={draft.details}
					onChange={(event) => onChange({ details: event.target.value })}
				/>
			</label>
			<div className="admin-grid">
				<label className="admin-field">
					<span>TAGS (comma-sep)</span>
					<input
						className="transmit-input"
						value={draft.tags}
						onChange={(event) => onChange({ tags: event.target.value })}
					/>
				</label>
				<label className="admin-field">
					<span>NOTE</span>
					<input
						className="transmit-input"
						value={draft.note}
						onChange={(event) => onChange({ note: event.target.value })}
					/>
				</label>
			</div>
			<label className="admin-field">
				<span>LINKS (label | url, one per line)</span>
				<textarea
					className="transmit-input transmit-textarea"
					rows={2}
					value={draft.links}
					onChange={(event) => onChange({ links: event.target.value })}
				/>
			</label>
			{onSave && (
				<button
					type="button"
					className="btn btn-neon"
					disabled={saving || !draft.id.trim() || !draft.name.trim()}
					onClick={onSave}
				>
					{saving ? "CREATING…" : "Create card"}
				</button>
			)}
			{onDelete && (
				<button
					type="button"
					className="btn btn-ghost admin-delete"
					onClick={onDelete}
				>
					DELETE
				</button>
			)}
		</div>
	);
}
