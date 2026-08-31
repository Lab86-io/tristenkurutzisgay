const SKILLS_ROW_1 = [
	"Angular",
	"C",
	"C++",
	"C#",
	"CSS",
	"Go",
	"HTML",
	"Java",
	"JavaScript",
];

const SKILLS_ROW_2 = [
	".NET",
	"PostgreSQL",
	"Python",
	"React",
	"Spring",
	"TypeScript",
];

export function About() {
	return (
		<section id="about" className="scroll-mt-24">
			<h1 className="font-myfont text-5xl text-white">
				<span className="animate-typing">Hey!</span>
			</h1>
			<h2 className="section-title mt-10">WHO AM I?</h2>
			<p className="section-sub max-w-3xl leading-relaxed">
				I'm Tristen, a software engineering student at RIT graduating Dec 2026.
				I most recently spent a summer at M&amp;T Bank building a Java test
				orchestration platform from scratch, and I'm looking for full-time roles
				starting after I graduate. I care a lot about process and ethics in
				software. The why behind what we build is really important to me, and I
				want to make sure that what we build is accessible to all kinds of
				people, is maintainable, and secure.
			</p>
			<p className="section-sub max-w-3xl leading-relaxed">
				Outside of that: I am a cat dad of two, have a Rimworld habit that I
				couldn't be paid a million dollars to break, do amateur photography, and
				pretty much any craft I can get my hands on.
			</p>
			<div>
				<div className="skills-label">LANGUAGES &amp; TOOLS</div>
				<div className="flex max-w-3xl flex-wrap gap-1.5">
					{SKILLS_ROW_1.map((skill) => (
						<span key={skill} className="skill-tag">
							{skill}
						</span>
					))}
				</div>
				<div className="mt-1.5 flex max-w-3xl flex-wrap gap-1.5">
					{SKILLS_ROW_2.map((skill) => (
						<span key={skill} className="skill-tag">
							{skill}
						</span>
					))}
				</div>
			</div>
		</section>
	);
}
