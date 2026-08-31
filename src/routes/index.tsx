import { createFileRoute } from "@tanstack/react-router";
import { About } from "../components/About";
import { Banner } from "../components/Banner";
import { Contact } from "../components/Contact";
import { Experience } from "../components/Experience";
import { Projects } from "../components/Projects";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div id="top" className="min-h-screen">
			<Banner />
			<main className="container-main grid grid-cols-1 gap-24 pb-24 pt-8 2xl:grid-cols-2 2xl:gap-x-16">
				<About />
				<Experience />
				<div className="2xl:col-span-2">
					<Projects />
				</div>
				<div className="2xl:col-span-2">
					<Contact />
				</div>
			</main>
		</div>
	);
}
