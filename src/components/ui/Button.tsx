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
    // A variante primária deve chamar mais atenção na hierarquia visual.
    solid:
    "bg-[var(--color-accent)] text-[#121212] border border-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] hover:border-[var(--color-accent-hover)]",

    // Borda com fundo transparente para ações secundárias.
    outline:
    "bg-transparent text-[var(--color-accent)] border border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10",

    // Ghost para ações discretas em áreas densas.
    ghost:
    "bg-transparent text-[var(--color-text-primary)] border border-transparent hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-accent)]",

    // Subtle para botões de apoio sem competir com o CTA principal.
    subtle:
    "bg-[var(--color-bg-card)] text-[var(--color-text-primary)] border border-[var(--color-bg-hover)] hover:bg-[var(--color-bg-hover)]",

    // Botão de alerta/sensível
    danger:
    "bg-[var(--color-status-busy)] text-[var(--color-text-primary)] border border-[var(--color-status-busy)] hover:bg-[#d12f3d] hover:border-[#d12f3d]"
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
            "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-dark)]",
            focusRingClass,
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
