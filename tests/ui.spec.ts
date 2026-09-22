import { expect, test } from "@playwright/test";

for (const width of [375, 1280]) {
	test(`cards clear the hand before changing layers at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto("/");
		await page.getByRole("button", { name: "Pause card rotation" }).click();
		for (const direction of ["Next", "Previous"]) {
			const result = await page.evaluate(async (direction) => {
				const fan = document.querySelector(".fan")!;
				const read = () =>
					[...fan.children].map((el) => ({
						id: el.querySelector("a")!.href,
						z: Number(getComputedStyle(el).zIndex),
						rect: el.getBoundingClientRect(),
					}));
				const top = (cards: ReturnType<typeof read>) =>
					cards.reduce((a, b) => (a.z > b.z ? a : b));
				let previous = top(read());
				const overlaps: number[] = [];
				(
					document.querySelector(
						`[aria-label="${direction} featured card"]`,
					) as HTMLButtonElement
				).click();
				const until = performance.now() + 1000;
				while (performance.now() < until) {
					await new Promise(requestAnimationFrame);
					const cards = read();
					const current = top(cards);
					if (previous.id !== current.id) {
						const a = cards.find((card) => card.id === previous.id)!.rect;
						const b = current.rect;
						overlaps.push(
							Math.max(
								0,
								Math.min(a.right, b.right) - Math.max(a.left, b.left),
							) / Math.min(a.width, b.width),
						);
					}
					previous = current;
				}
				return overlaps;
			}, direction);
			expect(result).toHaveLength(1);
			expect(result[0]).toBeLessThan(0.1);
			await expect(
				page.locator(".fan-card-deal-out, .fan-card-deal-in"),
			).toHaveCount(0);
		}
	});
}

test("reduced motion stops rotation and keeps manual navigation available", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/");
	await expect(
		page.getByRole("button", { name: "SIGN IN", exact: true }),
	).toBeVisible();
	const front = page.locator(".fan-card-front a");
	const current = await front.getAttribute("href");
	await page.waitForTimeout(4300);
	await expect(front).toHaveAttribute("href", current!);
	await page.getByRole("button", { name: "Next featured card" }).click();
	await expect(front).not.toHaveAttribute("href", current!);
	await expect(
		page.locator(".fan-card-deal-out, .fan-card-deal-in"),
	).toHaveCount(0);
});

test("public pages and large credit balances fit narrow screens", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	for (const width of [320, 390, 768, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		for (const path of ["/", "/collection", "/about", "/comms"]) {
			await page.goto(path);
			await expect(
				page.getByRole("button", { name: "SIGN IN", exact: true }).first(),
			).toBeVisible();
			const dimensions = await page.evaluate(() => ({
				viewport: document.documentElement.clientWidth,
				content: document.documentElement.scrollWidth,
			}));
			expect(dimensions.content, `${path} at ${width}px`).toBeLessThanOrEqual(
				dimensions.viewport,
			);
		}
		const balance = await page.locator(".credits-chip").evaluate((el) => {
			el.querySelector(".hud-control-label")!.textContent = "123456789";
			const rect = el.getBoundingClientRect();
			return {
				right: rect.right,
				viewport: document.documentElement.clientWidth,
				fits: el.scrollWidth <= el.clientWidth,
			};
		});
		expect(balance.fits).toBe(true);
		expect(balance.right).toBeLessThanOrEqual(balance.viewport);
	}
});

test("contrast control is visible and inventory filters explain empty results", async ({
	page,
}) => {
	await page.goto("/collection");
	const toggle = page.getByRole("switch", {
		name: "Toggle high contrast mode",
	});
	await expect(toggle).toBeVisible();
	await toggle.click();
	await expect(page.locator("html")).toHaveClass(/high-contrast/);
	await page.reload();
	await expect(page.getByRole("switch")).toBeChecked();
	await page.getByRole("button", { name: "OWNED", exact: true }).click();
	await expect(page.getByRole("status")).toContainText("No cards match");
});
