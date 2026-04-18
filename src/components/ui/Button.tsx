import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "solid" | "outline" | "ghost" | "subtle" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
};

function joinClasses(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

const variantClasses: Record<ButtonVariant, string> = {
    solid:
    "bg-[var(--color-accent)] text-[#161412] border border-[var(--color-accent)] shadow-[0_10px_24px_rgba(205,163,79,0.22)] hover:bg-[var(--color-accent-hover)] hover:border-[var(--color-accent-hover)] hover:shadow-[0_14px_30px_rgba(223,184,102,0.26)]",

    outline:
    "bg-transparent text-[var(--color-accent)] border border-[var(--color-border-strong)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10",

    ghost:
    "bg-transparent text-[var(--color-text-primary)] border border-transparent hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-accent)]",

    subtle:
    "bg-[var(--color-bg-card)] text-[var(--color-text-primary)] border border-[var(--color-border-soft)] hover:bg-[var(--color-bg-soft)]",

    danger:
    "bg-[var(--color-status-busy)] text-[var(--color-text-primary)] border border-[var(--color-status-busy)] shadow-[0_10px_24px_rgba(216,81,81,0.25)] hover:bg-[#c94646] hover:border-[#c94646]"
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-6 text-base",
};

export function Button({
    variant = "solid",
    size = "md",
    fullWidth = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    className,
    disabled,
    children,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || isLoading;
    const focusRingClass =
        variant === "danger"
            ? "focus-visible:ring-[var(--color-status-busy)]"
            : "focus-visible:ring-[var(--color-accent)]";

    return (
        <button
        className={joinClasses(
            "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-[0.01em] transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-dark)]",
            focusRingClass,
            "active:translate-y-px",
            "disabled:cursor-not-allowed disabled:opacity-60",
            variantClasses[variant],
            sizeClasses[size],
            fullWidth && "w-full",
            className,
        )}
        disabled={isDisabled}
        {...props}
        >
        {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
        ) : (
            leftIcon
        )}

        <span>{children}</span>

        {!isLoading && rightIcon}
        </button>
    );
}
