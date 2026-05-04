"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import {
  getBotState,
  getGreetingMessage,
  restartBot,
  setBotState,
  updateGreetingMessage,
} from "@/features/bot/api";

type BotState = {
  paused: boolean;
};

function BotStatusCard() {
  const { addToast } = useToast();
  const [state, setState] = useState<BotState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  useEffect(() => {
    async function loadState() {
      try {
        setIsLoading(true);
        const data = await getBotState();
        setState(data);
      } catch {
        addToast({
          title: "Erro ao carregar status",
          description: "Não foi possível verificar o estado do bot.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    void loadState();
  }, [addToast]);

  async function handleTogglePause() {
    const nextPaused = !state?.paused;

    try {
      setIsUpdating(true);
      const updated = await setBotState(nextPaused);
      setState(updated);

      addToast({
        title: nextPaused ? "Bot pausado" : "Bot retomado",
        description: nextPaused
          ? "O bot deixou de responder temporariamente."
          : "O bot voltou a responder mensagens.",
        type: "success",
      });
    } catch {
      addToast({
        title: "Não foi possível alterar o status",
        description: "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRestart() {
    try {
      setIsRestarting(true);
      await restartBot();
      addToast({
        title: "Bot reiniciado",
        description: "As conversas em memória foram limpas.",
        type: "success",
      });
    } catch {
      addToast({
        title: "Não foi possível reiniciar",
        description: "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setIsRestarting(false);
    }
  }

  const isPaused = state?.paused ?? false;

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-(--color-text-disabled) border-r-transparent" />
        <p className="text-sm text-(--color-text-secondary)">Carregando status do bot...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-disabled)">
            Status do bot
          </p>
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-3.5 w-3.5" aria-label={isPaused ? "Estado pausado" : "Estado ativo"}>
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  backgroundColor: isPaused
                    ? "var(--color-status-busy)"
                    : "var(--color-status-available)",
                  opacity: 0.7,
                }}
              />
              <span
                className="relative inline-flex h-3.5 w-3.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: isPaused
                    ? "var(--color-status-busy)"
                    : "var(--color-status-available)",
                  boxShadow: isPaused
                    ? "0 0 0 6px rgba(216, 81, 81, 0.2), 0 0 18px rgba(216, 81, 81, 0.45)"
                    : "0 0 0 6px rgba(49, 197, 119, 0.2), 0 0 18px rgba(49, 197, 119, 0.45)",
                }}
              />
            </span>
            <h2 className="text-lg font-semibold text-(--color-text-primary)">
              {isPaused ? "Bot pausado" : "Bot ativo"}
            </h2>
          </div>
          <p className="text-sm text-(--color-text-secondary)">
            {isPaused
              ? "O bot não está respondendo no momento."
              : "O bot está respondendo mensagens normalmente."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Button variant={isPaused ? "solid" : "outline"} onClick={handleTogglePause} isLoading={isUpdating}>
            {isPaused ? "Retomar bot" : "Parar bot"}
          </Button>
          <Button variant="subtle" onClick={handleRestart} isLoading={isRestarting}>
            Reiniciar bot
          </Button>
        </div>
      </div>
    </div>
  );
}

function GreetingEditorCard() {
  const { addToast } = useToast();
  const [content, setContent] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGreeting() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getGreetingMessage();
        setContent(data.content);
        setInitialContent(data.content);
      } catch {
        setError("Não foi possível carregar a mensagem de boas-vindas.");
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

  async function handleSave() {
    if (!content.trim()) {
      addToast({
        title: "Campo vazio",
        description: "A mensagem de boas-vindas não pode estar vazia.",
        type: "error",
      });
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateGreetingMessage(content.trim());
      setContent(updated.content);
      setInitialContent(updated.content);
      addToast({
        title: "Salvo com sucesso",
        description: "Mensagem de boas-vindas atualizada.",
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

  const hasChanges = content !== initialContent;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--color-text-disabled) border-r-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-(--color-status-busy)/30 bg-[rgba(230,57,70,0.06)] p-4">
        <p className="text-sm text-(--color-status-busy)">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-disabled)">
            Mensagem de boas-vindas
          </p>
          <p className="mt-2 text-sm text-(--color-text-secondary)">Texto enviado quando um cliente inicia contato com o bot.</p>
        </div>

        <span className="inline-flex items-center rounded-full border border-(--color-border-soft) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold text-(--color-text-secondary)">
          {content.length} caracteres
        </span>
      </div>

      <div className="mt-5 space-y-2">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Escreva aqui a mensagem que será enviada no primeiro contato."
          className="min-h-48 w-full resize-y rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-4 text-(--color-text-primary) outline-none transition duration-200 placeholder:text-(--color-text-disabled) focus:border-(--color-text-secondary)"
          style={{ boxShadow: "none" }}
          rows={6}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-(--color-border-soft) pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-(--color-text-disabled)">Ajuste esse texto para refletir o tom da sua barbearia.</p>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setContent(initialContent)}
            disabled={!hasChanges || isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} isLoading={isSaving}>
            Salvar mudanças
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ConfiguracoesPage() {
  return (
    <section className="container-shell pt-6 sm:pt-8">
      <div className="surface-panel reveal-up px-6 py-7 sm:px-8 sm:py-8">
        <p className="section-title">Preferências</p>
        <h1 className="mt-3 text-3xl font-semibold text-(--color-text-primary) sm:text-4xl">Configurações</h1>
        <p className="mt-2 text-sm text-(--color-text-secondary) sm:text-base">
          Defina parâmetros operacionais, integrações e comportamento do painel.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5">
        <div className="reveal-up" style={{ animationDelay: "40ms" }}>
          <BotStatusCard />
        </div>

        <div className="reveal-up" style={{ animationDelay: "80ms" }}>
          <GreetingEditorCard />
        </div>
      </div>
    </section>
  );
}
