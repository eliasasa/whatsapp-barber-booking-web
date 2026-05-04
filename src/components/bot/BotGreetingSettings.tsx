"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { getGreetingMessage, updateGreetingMessage } from "@/features/bot/api";

export function BotGreetingSettings() {
  const { addToast } = useToast();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    async function loadGreeting() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getGreetingMessage();
        setContent(data.content);
      } catch {
        setError("Não foi possível carregar a mensagem de greeting.");
        addToast({
          title: "Erro ao carregar",
          description: "Verifique a conexão e tente novamente.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    void loadGreeting();
  }, [addToast]);

  const handleChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
  };

  async function handleSave() {
    if (!content.trim()) {
      addToast({
        title: "Campo vazio",
        description: "A mensagem de greeting não pode estar vazia.",
        type: "error",
      });
      return;
    }

    try {
      setIsSaving(true);
      await updateGreetingMessage(content.trim());
      setHasChanges(false);
      addToast({
        title: "Salvo com sucesso",
        description: "Mensagem de greeting atualizada.",
        type: "success",
      });
    } catch {
      addToast({
        title: "Erro ao salvar",
        description: "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div
          className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-accent)" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "var(--color-error)", background: "rgba(230, 57, 70, 0.08)" }}
      >
        <p className="text-sm" style={{ color: "var(--color-error)" }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
            Mensagem de boas-vindas
          </label>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Texto enviado quando um cliente inicia contato com o bot.
          </p>
        </div>

        <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
          {content.length} caracteres
        </span>
      </div>

      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={content || "Digite a mensagem que será enviada quando um cliente novo contatar..."}
          className="min-h-[180px] w-full resize-y rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-4 text-[var(--color-text-primary)] outline-none transition duration-200 placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_rgba(205,163,79,0.08)]"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
          }}
          rows={6}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Ajuste esse texto para refletir o tom da sua barbearia.
        </p>

        <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => {
            setContent(content);
            setHasChanges(false);
          }}
          disabled={!hasChanges || isSaving}
        >
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges || isSaving} isLoading={isSaving}>
          Salvar Mudanças
        </Button>
        </div>
      </div>
    </div>
  );
}
