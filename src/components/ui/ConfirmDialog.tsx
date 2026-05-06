"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "solid" | "danger";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Sim",
  cancelText = "Não",
  confirmVariant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  const dialogContent = (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Fechar confirmação"
        className="absolute inset-0 cursor-default"
        onClick={onCancel}
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-(--color-border-soft) bg-(--color-bg-card) p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-accent)">
          Confirmação
        </p>

        <h2 className="mt-3 text-xl font-semibold text-(--color-text-primary)">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">{description}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} className="sm:min-w-28">
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="sm:min-w-28"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );

  const portalElement = typeof document !== "undefined" ? document.getElementById("modal-portal") : null;

  if (!portalElement) {
    return null;
  }

  return createPortal(dialogContent, portalElement);
}