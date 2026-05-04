"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { getBotState, restartBot, setBotState } from "@/features/bot/api";

type BotState = {
  paused: boolean;
};

export function BotStatusPanel() {
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
        description: nextPaused ? "O bot deixou de responder temporariamente." : "O bot voltou a responder mensagens.",
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
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-5 py-5">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-text-tertiary)] border-r-transparent" />
        <p className="text-sm text-[var(--color-text-secondary)]">Carregando status do bot...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <div className="h-1 w-full bg-[var(--color-accent)]" />

      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-sm font-semibold text-[var(--color-accent)]">
                BOT
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                  Status do bot
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {isPaused
                    ? "Bot parado: sem respostas automáticas neste momento."
                    : "Bot ativo: respondendo mensagens normalmente."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: isPaused ? "rgba(230, 57, 70, 0.12)" : "rgba(46, 204, 113, 0.14)",
                  color: isPaused ? "var(--color-status-busy)" : "var(--color-status-success)",
                }}
              >
                {isPaused ? "Pausado" : "Ativo"}
              </span>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                  Estado atual
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {isPaused
                    ? "As conversas seguem salvas, mas o bot não responde."
                    : "O bot está recebendo e respondendo normalmente."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 sm:justify-end">
            <Button
              variant={isPaused ? "solid" : "outline"}
              onClick={handleTogglePause}
              isLoading={isUpdating}
            >
              {isPaused ? "Retomar bot" : "Parar bot"}
            </Button>
            <Button variant="subtle" onClick={handleRestart} isLoading={isRestarting}>
              Reiniciar bot
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}