const CONTACTS = [
	{
		id: "email",
		label: "EMAIL",
		value: "tristenkurutz@gmail.com",
		href: "mailto:tristenkurutz@gmail.com",
	},
	{
		id: "linkedin",
		label: "LINKEDIN",
		value: "tristen-kurutz",
		href: "https://www.linkedin.com/in/tristen-kurutz",
	},
	{
		id: "github",
		label: "GITHUB",
		value: "tristenkurutz",
		href: "https://github.com/tristenkurutz",
	},
];

export function Contact() {
	return (
		<section id="contact" className="scroll-mt-24">
			<h2 className="section-title">CONTACT</h2>
			<p className="section-sub">
				I'm graduating Dec 2026 and looking for full-time roles. Feel free to
				reach out!
			</p>
			<div className="contact-links">
				{CONTACTS.map((contact) => (
					<a
						key={contact.id}
						id={contact.id}
						href={contact.href}
						target={contact.href.startsWith("mailto:") ? undefined : "_blank"}
						rel="noopener noreferrer"
						className="contact-link"
					>
						<span className="contact-label">{contact.label}</span>
						<span>{contact.value}</span>
					</a>
				))}
			</div>
		</section>
	);
}
