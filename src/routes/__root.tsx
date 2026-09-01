import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import appCss from "../styles.css?url";

const SITE_URL = "https://tristenkurutzisgay.tech";
const TITLE = "Tristen Kurutz — Software Engineer";
const DESCRIPTION =
	"Tristen Kurutz — software engineering student at RIT, graduating Dec 2026. Experience, projects, and contact.";
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
				content: "#44403c",
			},
			{ content: TITLE, property: "og:title" },
			{ content: DESCRIPTION, property: "og:description" },
			{ content: "website", property: "og:type" },
			{ content: `${SITE_URL}/`, property: "og:url" },
			{ content: OG_IMAGE, property: "og:image" },
			{ content: "1200", property: "og:image:width" },
			{ content: "630", property: "og:image:height" },
			{
				content: "Tristen Kurutz — Software Engineering, RIT '26",
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
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
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
