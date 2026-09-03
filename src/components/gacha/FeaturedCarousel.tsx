import { Link } from "@tanstack/react-router";
import autoplayPlugin from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GachaCardFace } from "./GachaCard";

export function FeaturedCarousel({
	cards,
}: {
	cards: Array<import("#/data/cards").GachaCard>;
}) {
	const [emblaRef, emblaApi] = useEmblaCarousel(
		{ loop: true, align: "start" },
		[
			autoplayPlugin({
				delay: 3800,
				stopOnInteraction: false,
				stopOnMouseEnter: true,
			}),
		],
	);
	const [selected, setSelected] = useState(0);
	const [snaps, setSnaps] = useState<number[]>([]);
	const scrollTimer = useRef<number | undefined>(undefined);

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

	useEffect(() => () => clearInterval(scrollTimer.current), []);

	if (!cards.length) return null;

	// hold a hover over an edge zone to sift through the carousel
	const startHoverScroll = (direction: 1 | -1) => {
		clearInterval(scrollTimer.current);
		emblaApi?.scrollTo(emblaApi.selectedScrollSnap() + direction);
		scrollTimer.current = window.setInterval(() => {
			emblaApi?.scrollTo(emblaApi.selectedScrollSnap() + direction);
		}, 1100);
	};

	const stopHoverScroll = () => clearInterval(scrollTimer.current);

	return (
		<div className="featured">
			<div className="featured-head">
				<h3 className="panel-title">Featured records</h3>
				<div className="featured-dots">
					{snaps.map((_, index) => (
						<button
							// biome-ignore lint/suspicious/noArrayIndexKey: static dot set, never reordered
							key={index}
							type="button"
							aria-label={`Go to slide ${index + 1}`}
							className={`featured-dot ${index === selected ? "featured-dot-on" : ""}`}
							onClick={() => emblaApi?.scrollTo(index)}
						/>
					))}
				</div>
			</div>
			<div className="featured-wrap">
				<button
					type="button"
					className="featured-zone featured-zone-left"
					aria-label="Previous card (hover to browse)"
					onPointerEnter={() => startHoverScroll(-1)}
					onPointerLeave={stopHoverScroll}
					onFocus={() => startHoverScroll(-1)}
					onBlur={stopHoverScroll}
				/>
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
				<button
					type="button"
					className="featured-zone featured-zone-right"
					aria-label="Next card (hover to browse)"
					onPointerEnter={() => startHoverScroll(1)}
					onPointerLeave={stopHoverScroll}
					onFocus={() => startHoverScroll(1)}
					onBlur={stopHoverScroll}
				/>
			</div>
			<div className="featured-hint dim">
				hover an edge to browse · click a card to inspect
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
