const EXPERIENCES = [
	{
		company: "M&T Bank",
		location: "Buffalo, NY",
		role: "SOFTWARE ENGINEERING INTERN",
		tags: ["JAVA", "PLAYWRIGHT", "GITLAB CI/CD"],
		period: "Jun 2026 – Aug 2026",
		details: [
			"Built a Java test orchestration platform from scratch for running suites across teams.",
			"Added Playwright-based end-to-end suites to GitLab CI/CD pipelines.",
		],
	},
	{
		company: "Benco Dental",
		location: "Virtual",
		role: "FRONTEND SOFTWARE INTERN",
		tags: ["C#", ".NET", "REACT"],
		period: "Jan 2026 – Jun 2026",
		details: [
			"Frontend development on React applications backed by C#/.NET services.",
		],
	},
	{
		company: "Innovative Systems, Inc.",
		location: "Pittsburgh, PA",
		role: "FULL-STACK SOFTWARE INTERN",
		tags: ["C#", ".NET", "REACT"],
		period: "Sep 2025 – Dec 2025",
		details: ["Full-stack work across C#/.NET services and React frontends."],
	},
	{
		company: "M&T Bank",
		location: "Buffalo, NY",
		role: "FRONTEND SOFTWARE INTERN",
		tags: ["ANGULAR", "FIGMA", "REST APIS"],
		period: "Jun 2025 – Aug 2025",
		details: [
			"Built Angular frontend features against REST APIs, working from Figma designs.",
		],
	},
	{
		company: "Casey K. HQ",
		location: "Virtual",
		role: "WEB DEVELOPER",
		tags: ["WORDPRESS", "ELEMENTOR", "WOOCOMMERCE", "AUTOMATORWP"],
		period: "Aug 2024 – Jun 2025",
		details: [
			"Ran a WordPress/WooCommerce site with Elementor and AutomatorWP automations.",
		],
	},
	{
		company: "M&T Bank",
		location: "Buffalo, NY",
		role: "TECHNOLOGY INTERN",
		tags: ["CI/CD", "ARTIFACTORY", "SECURITY SCANNING"],
		period: "Jun 2024 – Aug 2024",
		details: [
			"Worked on CI/CD pipelines, artifact management, and security scanning.",
		],
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
				{EXPERIENCES.map((exp, index) => (
					<div key={`${exp.company}-${exp.period}`} className="accordion">
						<details className="exp-details" open={index === 0}>
							<summary>
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
								<div className="flex items-center gap-3 pt-1">
									<div className="accordion-dates">{exp.period}</div>
									<span className="exp-chevron" aria-hidden="true">
										+
									</span>
								</div>
							</summary>
							<ul className="exp-bullets">
								{exp.details.map((detail) => (
									<li key={detail}>{detail}</li>
								))}
							</ul>
						</details>
					</div>
				))}
			</div>
		</section>
	);
}
