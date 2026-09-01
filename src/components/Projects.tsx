const PROJECTS = [
	{
		name: "Contrax",
		subtitle: "SENIOR PROJECT WITH MINDEX",
		note: "repo private (NDA)",
		description:
			"Senior capstone with Mindex as sponsor. React Native fantasy football app where I'm PM and frontend dev. Restructured how we broke down tasks and doubled sprint velocity. Also refactored a messy legacy frontend and wrote a Go script to seed test users for stakeholder demos.",
		tags: ["REACT NATIVE", "EXPO", "GO"],
		links: [] as { label: string; href: string }[],
	},
	{
		name: "Bird Scholar",
		subtitle: "UNDERGRADUATE RESEARCH",
		note: null,
		description:
			"Undergrad research project for WGST-225 looking at citational bias in avian behavioral biology. Built citation network graphs from 105 papers using the Semantic Scholar API, NetworkX, and ForceAtlas2. Found the same-sex behavior literature was notably less connected, with the most-cited paper being a review calling for more data.",
		tags: ["PYTHON", "NETWORKX", "HTML", "CSS", "JAVASCRIPT"],
		links: [
			{
				label: "GitHub ↗",
				href: "https://github.com/tristenkurutz/bird-scholar",
			},
			{ label: "Live ↗", href: "https://tristenkurutz.github.io/bird-scholar" },
		],
	},
	{
		name: "Personal Website",
		subtitle: "PERSONAL PROJECT",
		note: null,
		description:
			"My personal portfolio site, built with TanStack Start (React), Tailwind, and GT Walsheim. Still a work in progress.",
		tags: ["TANSTACK START", "REACT", "TYPESCRIPT", "TAILWIND"],
		links: [
			{
				label: "GitHub ↗",
				href: "https://github.com/tristenkurutz/personal-website",
			},
		],
	},
	{
		name: "Slack-Discord Bridge",
		subtitle: "PERSONAL PROJECT",
		note: null,
		description:
			"Mirrors messages between a Slack channel and a Discord channel in both directions, in real time. Three separate processes (Slack listener, Discord bot, Flask server) running in parallel to relay messages across platforms.",
		tags: ["PYTHON", "FLASK", "WEBSOCKETS"],
		links: [
			{
				label: "GitHub ↗",
				href: "https://github.com/tristenkurutz/slack-discord-bridge",
			},
		],
	},
];

export function Projects() {
	return (
		<section id="projects" className="scroll-mt-24">
			<h2 className="section-title">PROJECTS</h2>
			<div className="grid gap-4 sm:grid-cols-2">
				{PROJECTS.map((project) => (
					<div key={project.name} className="project-card">
						<div className="flex items-start justify-between gap-3">
							<div>
								<h3 className="project-title">{project.name}</h3>
								<p className="project-subtitle mt-1">{project.subtitle}</p>
								{project.note && (
									<p className="project-note mt-1">{project.note}</p>
								)}
							</div>
							{project.links.length > 0 && (
								<div className="flex shrink-0 gap-3">
									{project.links.map((link) => (
										<a
											key={link.label}
											href={link.href}
											target="_blank"
											rel="noopener noreferrer"
											className="project-link"
										>
											{link.label}
										</a>
									))}
								</div>
							)}
						</div>
						<p className="project-desc">{project.description}</p>
						<div className="flex flex-wrap gap-1.5">
							{project.tags.map((tag) => (
								<span key={tag} className="project-tag">
									{tag}
								</span>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
