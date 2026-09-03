import { Link } from "@tanstack/react-router";
import autoplayPlugin from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { GachaCardFace } from "./GachaCard";

export function FeaturedCarousel({
	cards,
}: {
	cards: Array<import("#/data/cards").GachaCard>;
}) {
	const [emblaRef, emblaApi] = useEmblaCarousel(
		{ loop: true, align: "start" },
		[autoplayPlugin({ delay: 3800, stopOnInteraction: false })],
	);
	const [selected, setSelected] = useState(0);
	const [snaps, setSnaps] = useState<number[]>([]);

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setSelected(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		setSnaps(emblaApi.scrollSnapList());
		onSelect();
		emblaApi.on("select", onSelect);
		emblaApi.on("reInit", onSelect);
	}, [emblaApi, onSelect]);

	if (!cards.length) return null;

	return (
		<div className="featured">
			<div className="featured-head">
				<h3 className="panel-title">Featured records</h3>
				<div className="featured-dots">
					{snaps.map((_, index) => (
						<button
							key={index}
							type="button"
							aria-label={`Go to slide ${index + 1}`}
							className={`featured-dot ${index === selected ? "featured-dot-on" : ""}`}
							onClick={() => emblaApi?.scrollTo(index)}
						/>
					))}
				</div>
			</div>
			<div className="featured-viewport" ref={emblaRef}>
				<div className="featured-track">
					{cards.map((card) => (
						<div key={card.id} className="featured-slide">
							<Link
								to="/collection"
								search={{ card: card.id }}
								className="featured-link"
								aria-label={`View ${card.name}`}
							>
								<GachaCardFace card={card} state="reveal" />
							</Link>
						</div>
					))}
				</div>
			</div>
			<div className="featured-arrows">
				<button
					type="button"
					className="featured-arrow"
					onClick={() => emblaApi?.scrollPrev()}
					aria-label="Previous card"
				>
					‹
				</button>
				<button
					type="button"
					className="featured-arrow"
					onClick={() => emblaApi?.scrollNext()}
					aria-label="Next card"
				>
					›
				</button>
			</div>
		</div>
	);
}
