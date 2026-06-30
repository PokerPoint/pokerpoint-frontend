"use client";

import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import style from "./Toast.module.css";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
	id: number;
	kind: ToastKind;
	message: string;
}

interface ToastApi {
	notify: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		return { notify: () => {} };
	}
	return ctx;
}

const icons = {
	success: CheckCircle2,
	error: XCircle,
	info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const counter = useRef(0);

	const notify = useCallback((message: string, kind: ToastKind = "info") => {
		const id = counter.current++;
		setToasts((prev) => [...prev, { id, kind, message }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 3600);
	}, []);

	return (
		<ToastContext.Provider value={{ notify }}>
			{children}
			<div className={style.stack} aria-live="polite">
				{toasts.map((toast) => {
					const Icon = icons[toast.kind];
					return (
						<div key={toast.id} className={`${style.toast} ${style[toast.kind]}`}>
							<Icon size={18} />
							<span>{toast.message}</span>
						</div>
					);
				})}
			</div>
		</ToastContext.Provider>
	);
}
