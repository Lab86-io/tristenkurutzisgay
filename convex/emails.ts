"use node";

import nodemailer from "nodemailer";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

/**
 * One-way notification email for the contact form, sent via plain SMTP
 * with nodemailer. Activates as soon as SMTP_USER + SMTP_PASS are set on
 * the deployment (e.g. a Gmail app password for jakob@lab86.io —
 * host smtp.gmail.com, port 465). Until then it no-ops; messages are
 * still stored in Convex and visible in the admin inbox.
 */
export const sendContactEmail = internalAction({
	args: {
		name: v.string(),
		email: v.string(),
		message: v.string(),
	},
	handler: async (_ctx, args) => {
		const smtpUser = process.env.SMTP_USER;
		const smtpPass = process.env.SMTP_PASS;
		const notifyEmail = process.env.NOTIFY_EMAIL ?? "tristenkurutz@gmail.com";
		if (!smtpUser || !smtpPass) {
			return { sent: false, reason: "email_not_configured" as const };
		}

		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST ?? "smtp.gmail.com",
			port: Number(process.env.SMTP_PORT ?? 465),
			secure: Number(process.env.SMTP_PORT ?? 465) === 465,
			auth: { user: smtpUser, pass: smtpPass },
		});

		const info = await transporter.sendMail({
			from: process.env.SMTP_FROM ?? smtpUser,
			to: notifyEmail,
			replyTo: args.email,
			subject: `SUMMONS contact — ${args.name}`,
			text: `${args.name} (${args.email}) wrote via the portfolio contact form:\n\n${args.message}`,
			html: `<p><strong>${args.name}</strong> (${args.email}) wrote via the portfolio contact form:</p><pre style="font-family:ui-monospace,monospace;white-space:pre-wrap">${args.message.replace(/</g, "&lt;")}</pre>`,
		});

		return { sent: true, messageId: info.messageId };
	},
});
