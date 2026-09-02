import { toastStore, useToasts } from "#/lib/toasts";

export function Toasts() {
	const toasts = useToasts();
	if (!toasts.length) return null;
	return (
		<div className="toast-stack" role="log" aria-live="polite">
			{toasts.map((toast) => (
				<button
					key={toast.id}
					type="button"
					className="toast"
					data-tone={toast.tone}
					onClick={() => toastStore.dismiss(toast.id)}
				>
					<span className="toast-title">{toast.title}</span>
					{toast.body && <span className="toast-body">{toast.body}</span>}
				</button>
			))}
		</div>
	);
}
