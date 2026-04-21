import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { ToastMessage } from "./ToastContext";

const toastStyles = {
    success: {
        icon: <CheckCircle2 className="h-5 w-5 text-[var(--color-status-available)]" />,
        container: "border-[var(--color-status-available)]/30",
        accent: "bg-[var(--color-status-available)]",
        ring: "shadow-[0_18px_40px_rgba(49,197,119,0.14)]",
    },
    error: {
        icon: <AlertCircle className="h-5 w-5 text-[var(--color-status-busy)]" />,
        container: "border-[var(--color-status-busy)]/30",
        accent: "bg-[var(--color-status-busy)]",
        ring: "shadow-[0_18px_40px_rgba(216,81,81,0.16)]",
    },
    info: {
        icon: <Info className="h-5 w-5 text-[var(--color-accent)]" />,
        container: "border-[var(--color-border-strong)]",
        accent: "bg-[var(--color-accent)]",
        ring: "shadow-[0_18px_40px_rgba(205,163,79,0.12)]",
    },
    warning: {
        icon: <AlertTriangle className="h-5 w-5 text-[var(--color-status-ongoing)]" />,
        container: "border-[var(--color-status-ongoing)]/30",
        accent: "bg-[var(--color-status-ongoing)]",
        ring: "shadow-[0_18px_40px_rgba(223,157,77,0.14)]",
    },
};

interface ToastProps {
    message: ToastMessage;
    onRemove: (id: string) => void;
}

const AUTO_DISMISS_DELAY = 5000;
const EXIT_ANIMATION_DURATION = 260;

export function Toast({ message, onRemove }: ToastProps) {
    const style = toastStyles[message.type];
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const typeLabel = {
        success: "Sucesso",
        error: "Erro",
        info: "Informação",
        warning: "Aviso",
    }[message.type];

    useEffect(() => {
        const showTimer = window.requestAnimationFrame(() => {
            setIsVisible(true);
        });

        const hideTimer = window.setTimeout(() => {
            setIsLeaving(true);

            window.setTimeout(() => {
                onRemove(message.id);
            }, EXIT_ANIMATION_DURATION);
        }, AUTO_DISMISS_DELAY);

        return () => {
            window.cancelAnimationFrame(showTimer);
            window.clearTimeout(hideTimer);
        };
    }, [message.id, onRemove]);

    function handleClose() {
        if (isLeaving) {
            return;
        }

        setIsLeaving(true);

        window.setTimeout(() => {
            onRemove(message.id);
        }, EXIT_ANIMATION_DURATION);
    }

    return (
        <div
            className={`surface-panel relative w-full max-w-full overflow-hidden border px-4 py-4 text-[var(--color-text-primary)] backdrop-blur-md ${style.container} ${style.ring} toast-item ${isVisible && !isLeaving ? "toast-visible" : "toast-hidden"}`}
            role="alert"
        >
            <div className={`absolute inset-y-0 left-0 w-1 ${style.accent}`} />
            <div className="absolute inset-x-0 top-0 h-px bg-white/5" />

            <div className="flex items-start gap-3 pl-2">
                <div className="flex-shrink-0 mt-0.5 rounded-full bg-[var(--color-bg-dark)]/50 p-2 ring-1 ring-inset ring-white/5">
                    {style.icon}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                        {typeLabel}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-[var(--color-text-primary)] break-words">
                        {message.title}
                    </h3>
                    {message.description && (
                        <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)] break-words">
                            {message.description}
                        </p>
                    )}
                </div>

                <button
                    onClick={handleClose}
                    className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-soft)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    aria-label="Fechar notificação"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}