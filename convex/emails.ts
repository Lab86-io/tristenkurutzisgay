import { v } from "convex/values";
import { internalAction } from "./_generated/server";

/**
 * Sends the contact-form notification email via Nylas v3.
 * Activates as soon as NYLAS_API_KEY + NYLAS_GRANT_ID are set on the
 * deployment; until then it no-ops (messages are still stored in Convex
 * and visible in the admin inbox).
 */
export const sendContactEmail = internalAction({
	args: {
		name: v.string(),
		email: v.string(),
		message: v.string(),
	},
	handler: async (_ctx, args) => {
		const apiKey = process.env.NYLAS_API_KEY;
		const grantId = process.env.NYLAS_GRANT_ID;
		const notifyEmail = process.env.NOTIFY_EMAIL ?? "tristenkurutz@gmail.com";
		if (!apiKey || !grantId) {
			return { sent: false, reason: "email_not_configured" as const };
		}

		const response = await fetch(
			`https://api.nylas.com/v3/grants/${grantId}/messages/send`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					to: [{ email: notifyEmail, name: "Tristen Kurutz" }],
					reply_to: [{ email: args.email, name: args.name }],
					subject: `SUMMONS contact — ${args.name}`,
					body: `<p><strong>${args.name}</strong> (${args.email}) wrote via the portfolio contact form:</p><pre style="font-family:ui-monospace,monospace;white-space:pre-wrap">${args.message.replace(/</g, "&lt;")}</pre>`,
					tracking_options: { opens: false, thread_replies: false },
				}),
			},
		);
		if (!response.ok) {
			return {
				sent: false,
				reason: `nylas_error_${response.status}` as const,
			};
		}
		return { sent: true as const };
	},
});
