import { useEffect, useRef, useState } from "react";

const CONTACTS = [
	{
		id: "email",
		label: "EMAIL",
		value: "tristenkurutz@gmail.com",
		href: "mailto:tristenkurutz@gmail.com",
	},
	{
		id: "resume",
		label: "RESUME",
		value: "PDF ↗",
		href: "/resume.pdf",
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

const EMAIL = "tristenkurutz@gmail.com";

export function Contact() {
	const [copied, setCopied] = useState(false);
	const timerRef = useRef<number | undefined>(undefined);

	useEffect(() => () => clearTimeout(timerRef.current), []);

	const copyEmail = async () => {
		try {
			await navigator.clipboard.writeText(EMAIL);
			setCopied(true);
			clearTimeout(timerRef.current);
			timerRef.current = window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// clipboard blocked; the mailto link still works
		}
	};

	return (
		<section id="contact" className="scroll-mt-24">
			<h2 className="section-title">CONTACT</h2>
			<p className="section-sub">
				I'm graduating Dec 2026 and looking for full-time roles. Feel free to
				reach out!
			</p>
			<div className="contact-links">
				{CONTACTS.map((contact) =>
					contact.id === "email" ? (
						<div key={contact.id} className="contact-link">
							<span className="contact-label">{contact.label}</span>
							<a href={contact.href} className="contact-value">
								{contact.value}
							</a>
							<button type="button" className="copy-btn" onClick={copyEmail}>
								{copied ? "COPIED" : "COPY"}
							</button>
						</div>
					) : (
						<a
							key={contact.id}
							id={contact.id}
							href={contact.href}
							target={contact.href.startsWith("mailto:") ? undefined : "_blank"}
							rel="noopener noreferrer"
							className="contact-link"
						>
							<span className="contact-label">{contact.label}</span>
							<span className="contact-value">{contact.value}</span>
						</a>
					),
				)}
			</div>
		</section>
	);
}
