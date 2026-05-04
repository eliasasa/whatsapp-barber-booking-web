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
        className="p-4 rounded-lg border"
        style={{ borderColor: "var(--color-error)", background: "rgba(230, 57, 70, 0.1)" }}
      >
        <p className="text-sm" style={{ color: "var(--color-error)" }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
          Mensagem de Greeting
        </label>
        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Defina a mensagem que será enviada quando um cliente novo contatar..."
          className="w-full px-4 py-3 rounded-lg border-2 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]"
          style={{
            borderColor: "var(--color-border)",
          }}
          rows={6}
        />
        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
          {content.length} caracteres
        </p>
      </div>

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
  );
}
