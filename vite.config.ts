import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: {
		tsconfigPaths: true,
		// keep a single @clerk/react module instance — the ClerkProvider and
		// useAuth contexts must come from the same copy or SSR throws
		dedupe: [
			"react",
			"react-dom",
			"@clerk/react",
			"@clerk/clerk-react",
			"@clerk/shared",
			"@clerk/tanstack-react-start",
			"convex",
		],
	},
	plugins: [
		devtools(),
		nitro({ rollupConfig: { external: [/^@sentry\//] } }),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
