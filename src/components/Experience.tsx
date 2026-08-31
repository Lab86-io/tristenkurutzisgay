const EXPERIENCES = [
	{
		company: "M&T Bank",
		location: "Buffalo, NY",
		role: "SOFTWARE ENGINEERING INTERN",
		tags: ["JAVA", "PLAYWRIGHT", "GITLAB CI/CD"],
		period: "Jun 2026 – Aug 2026",
	},
	{
		company: "Benco Dental",
		location: "Virtual",
		role: "FRONTEND SOFTWARE INTERN",
		tags: ["C#", ".NET", "REACT"],
		period: "Jan 2026 – Jun 2026",
	},
	{
		company: "Innovative Systems, Inc.",
		location: "Pittsburgh, PA",
		role: "FULL-STACK SOFTWARE INTERN",
		tags: ["C#", ".NET", "REACT"],
		period: "Sep 2025 – Dec 2025",
	},
	{
		company: "M&T Bank",
		location: "Buffalo, NY",
		role: "FRONTEND SOFTWARE INTERN",
		tags: ["ANGULAR", "FIGMA", "REST APIS"],
		period: "Jun 2025 – Aug 2025",
	},
	{
		company: "Casey K. HQ",
		location: "Virtual",
		role: "WEB DEVELOPER",
		tags: ["WORDPRESS", "ELEMENTOR", "WOOCOMMERCE", "AUTOMATORWP"],
		period: "Aug 2024 – Jun 2025",
	},
	{
		company: "M&T Bank",
		location: "Buffalo, NY",
		role: "TECHNOLOGY INTERN",
		tags: ["CI/CD", "ARTIFACTORY", "SECURITY SCANNING"],
		period: "Jun 2024 – Aug 2024",
	},
];

export function Experience() {
	return (
		<section id="experience" className="scroll-mt-24">
			<h2 className="section-title">INDUSTRY EXPERIENCE</h2>
			<p className="section-sub">
				I've interned at a few places while at RIT, including:
			</p>
			<div>
				{EXPERIENCES.map((exp) => (
					<div key={`${exp.company}-${exp.period}`} className="accordion">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h3 className="accordion-company">
									{exp.company} — {exp.location}
								</h3>
								<p className="accordion-role">{exp.role}</p>
								<div className="mt-2 flex flex-wrap gap-1.5">
									{exp.tags.map((tag) => (
										<span key={tag} className="accordion-tag">
											{tag}
										</span>
									))}
								</div>
							</div>
							<div className="accordion-dates pt-1">{exp.period}</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
