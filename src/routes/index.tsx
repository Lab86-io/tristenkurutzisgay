import { createFileRoute } from "@tanstack/react-router";
import { About } from "../components/About";
import { Banner } from "../components/Banner";
import { Contact } from "../components/Contact";
import { Experience } from "../components/Experience";
import { Projects } from "../components/Projects";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div id="top" className="min-h-screen bg-stone-700 text-stone-400">
			<Banner />
			<main className="container-main flex flex-col gap-24 pb-24 pt-8">
				<About />
				<Experience />
				<Projects />
				<Contact />
			</main>
		</div>
	);
}
