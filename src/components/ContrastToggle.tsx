import * as Switch from "@radix-ui/react-switch";

interface ContrastToggleProps {
	checked: boolean;
	disabled?: boolean;
	onCheckedChange: (checked: boolean) => void;
}

export function ContrastToggle({
	checked,
	disabled,
	onCheckedChange,
}: ContrastToggleProps) {
	return (
		<label htmlFor="contrast" className="contrast-control">
			<Switch.Root
				id="contrast"
				className="contrast-toggle"
				checked={checked}
				disabled={disabled}
				onCheckedChange={onCheckedChange}
				aria-label="Toggle high contrast mode"
			>
				<Switch.Thumb className="contrast-toggle-thumb" />
			</Switch.Root>
			CONTRAST
		</label>
	);
}
