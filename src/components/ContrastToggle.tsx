import * as Switch from "@radix-ui/react-switch";

interface ContrastToggleProps {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}

export function ContrastToggle({
	checked,
	onCheckedChange,
}: ContrastToggleProps) {
	return (
		<span className="flex select-none items-center gap-2 text-xs tracking-widest text-white/60 transition-colors hover:text-white">
			<Switch.Root
				id="contrast"
				className="contrast-toggle"
				checked={checked}
				onCheckedChange={onCheckedChange}
				aria-label="Toggle high contrast mode"
			>
				<Switch.Thumb className="contrast-toggle-thumb" />
			</Switch.Root>
			CONTRAST
		</span>
	);
}
