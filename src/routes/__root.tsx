import { ClerkProvider, useAuth } from "@clerk/tanstack-react-start";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

import { Hud } from "#/components/gacha/Hud";
import { Toasts } from "#/components/gacha/Toasts";
import appCss from "../styles.css?url";

const convexUrl = import.meta.env.VITE_CONVEX_URL ?? "";
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

const SITE_URL = "https://tristenkurutzisgay.tech";
const TITLE = "TRISTEN KURUTZ — SUMMONS";
const DESCRIPTION =
	"A gacha-style portfolio. Spend credits, pull cards, and decrypt the career of Tristen Kurutz — software engineering student at RIT, graduating Dec 2026.";
const OG_IMAGE = `${SITE_URL}/og.png`;

const personSchema = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: "Tristen Kurutz",
	url: SITE_URL,
	image: OG_IMAGE,
	jobTitle: "Software Engineer",
	alumniOf: {
		"@type": "CollegeOrUniversity",
		name: "Rochester Institute of Technology",
	},
	sameAs: [
		"https://www.linkedin.com/in/tristen-kurutz",
		"https://github.com/tristenkurutz",
	],
};

const contrastInit = `try {
  var stored = localStorage.getItem("high-contrast");
  var prefersMore = window.matchMedia("(prefers-contrast: more)").matches;
  if (stored === "true" || (stored === null && prefersMore)) {
    document.documentElement.classList.add("high-contrast");
  }
} catch {}`;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: TITLE,
			},
			{
				name: "description",
				content: DESCRIPTION,
			},
			{
				name: "theme-color",
				content: "#060911",
			},
			{ content: TITLE, property: "og:title" },
			{ content: DESCRIPTION, property: "og:description" },
			{ content: "website", property: "og:type" },
			{ content: `${SITE_URL}/`, property: "og:url" },
			{ content: OG_IMAGE, property: "og:image" },
			{ content: "1200", property: "og:image:width" },
			{ content: "630", property: "og:image:height" },
			{
				content: "TRISTEN KURUTZ — SUMMONS. A gacha-style portfolio.",
				property: "og:image:alt",
			},
			{ content: "Tristen Kurutz", property: "og:site_name" },
			{ content: "summary_large_image", name: "twitter:card" },
			{ content: TITLE, name: "twitter:title" },
			{ content: DESCRIPTION, name: "twitter:description" },
			{ content: OG_IMAGE, name: "twitter:image" },
		],
		links: [
			{
				rel: "canonical",
				href: `${SITE_URL}/`,
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},
			{
				rel: "preload",
				href: "/fonts/GT-Walsheim-Pro-Black.woff2",
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
		],
		scripts: [
			{ children: contrastInit },
			{ type: "application/ld+json", children: JSON.stringify(personSchema) },
		],
	}),
	component: RootLayout,
	notFoundComponent: NotFound,
	shellComponent: RootDocument,
});

function RootLayout() {
	return (
		<>
			<Hud />
			<main id="main" className="site-main">
				<Outlet />
			</main>
			<footer className="site-footer">
				<span>© 2026 TRISTEN KURUTZ — NO REFUNDS ON PULLS</span>
				<span className="dim">RATES ARE PUBLISHED. PITY IS REAL.</span>
			</footer>
			<Toasts />
			<div className="scanlines" aria-hidden="true" />
		</>
	);
}

function NotFound() {
	return (
		<div className="notfound-page">
			<h1 className="page-title font-myfont">SIGNAL LOST</h1>
			<p className="section-sub">That record doesn't exist.</p>
			<Link to="/" className="btn btn-neon">
				RETURN TO SUMMON ▸
			</Link>
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const content = convexClient ? (
		<ClerkProvider publishableKey={clerkPublishableKey}>
			<ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
				{children}
			</ConvexProviderWithClerk>
		</ClerkProvider>
	) : (
		children
	);

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{content}
				{import.meta.env.DEV && (
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				)}
				<Scripts />
			</body>
		</html>
	);
}
