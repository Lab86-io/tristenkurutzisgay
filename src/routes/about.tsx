import { createFileRoute, Link } from "@tanstack/react-router";
import { StatBars } from "#/components/gacha/CardDetail";
import { OperatorExam } from "#/components/gacha/OperatorExam";
import { CHARACTER_CARD } from "#/data/cards";
import { useCards } from "#/hooks/useCards";
import { useGachaSession } from "#/hooks/useGacha";
import { ACHIEVEMENTS } from "#/lib/achievements";

export const Route = createFileRoute("/about")({
	head: () => ({
		meta: [{ title: "Dossier — Tristen Kurutz" }],
	}),
	component: DossierPage,
});

const Affiliations = [
	{
		name: "RIT Society of Software Engineers",
		role: "President (Fall 2026) · Secretary (Spring 2026) · Treasurer (Spring 2025) · Mentor (Fall 2024)",
		period: "2024 — PRESENT",
	},
	{
		name: "RIT Caring Hearts for Cats",
		role: "E-Board Member",
		period: "2023 — PRESENT",
	},
];

function DossierPage() {
	const { state } = useGachaSession();
	const { byId } = useCards();
	const characterCard = byId.get("tk-character") ?? CHARACTER_CARD;
	return (
		<div className="dossier-page">
			<h1 className="page-title font-myfont">Dossier</h1>
			<p className="section-sub">The person behind the cards.</p>

			<div className="dossier-grid">
				<section className="panel">
					<h2 className="panel-title">Who am I?</h2>
					<p className="panel-body">
						I'm Tristen, a software engineering student at RIT graduating Dec
						2026. I most recently spent a summer at M&amp;T Bank building a Java
						test orchestration platform from scratch, and I'm looking for
						full-time roles starting after I graduate.
					</p>
					<p className="panel-body">
						I care a lot about process and ethics in software. The why behind
						what we build is really important to me, and I want to make sure
						that what we build is accessible to all kinds of people, is
						maintainable, and secure.
					</p>
					<p className="panel-body">
						Outside of that: I am a cat dad of two, have a Rimworld habit that I
						couldn't be paid a million dollars to break, do amateur photography,
						and pretty much any craft I can get my hands on.
					</p>
				</section>

				<section className="panel">
					<h2 className="panel-title">Operator stats</h2>
					<StatBars stats={characterCard.stats ?? []} />
				</section>

				<section className="panel">
					<h2 className="panel-title">Education</h2>
					<p className="panel-body">
						<strong className="lit">Rochester Institute of Technology</strong>
						<br />
						B.S. Software Engineering · Minor in Environmental Studies · Dec
						2026
					</p>
				</section>

				<section className="panel">
					<h2 className="panel-title">Affiliations</h2>
					<ul className="affiliation-list">
						{Affiliations.map((affiliation) => (
							<li key={affiliation.name} className="affiliation">
								<div className="affiliation-head">
									<span className="lit">{affiliation.name}</span>
									<span className="dim affiliation-period">
										{affiliation.period}
									</span>
								</div>
								<span className="affiliation-role">{affiliation.role}</span>
							</li>
						))}
					</ul>
				</section>
			</div>

			<section className="panel dossier-trophies">
				<h2 className="panel-title">Commendations</h2>{" "}
				<ul className="trophy-list">
					{ACHIEVEMENTS.map((achievement) => {
						const unlockedAt = state.achievements[achievement.id];
						return (
							<li
								key={achievement.id}
								className="trophy"
								data-locked={unlockedAt ? undefined : true}
							>
								<span className="trophy-name">
									{unlockedAt ? "✓" : "·"} {achievement.name}
								</span>
								<span className="trophy-desc">{achievement.description}</span>
								<span className="trophy-reward">
									{unlockedAt ? "UNLOCKED" : `+${achievement.reward}◈`}
								</span>
							</li>
						);
					})}
				</ul>
			</section>

			<OperatorExam />

			<p className="dossier-foot">
				Want the human-readable version?{" "}
				<Link to="/comms" className="neon-link">
					Open comms ▸
				</Link>
			</p>
		</div>
	);
}
