import { type ReactNode, useEffect, useRef } from "react";

export function Modal({
	open,
	onClose,
	label,
	children,
}: {
	open: boolean;
	onClose: () => void;
	label: string;
	children: ReactNode;
}) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	return (
		<dialog
			ref={ref}
			className="modal"
			aria-label={label}
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
			onPointerDown={(event) => {
				if (event.target === ref.current) onClose();
			}}
		>
			<div className="modal-inner">
				<button
					type="button"
					className="modal-close"
					aria-label="Close"
					onClick={onClose}
				>
					✕
				</button>
				{children}
			</div>
		</dialog>
	);
}
