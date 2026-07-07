"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { listBroadcasts, startBroadcast } from "@/features/broadcast";
import { listServices } from "@/features/services";
import type { Broadcast, BroadcastFilter } from "@/types/broadcast";
import type { Service } from "@/types/service";
import type { ReactNode } from "react";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Aguardando",  className: "bg-[rgba(200,160,50,0.14)] text-yellow-400" },
  RUNNING: { label: "Enviando...", className: "bg-[rgba(49,130,197,0.14)] text-blue-400" },
  DONE:    { label: "Concluído",   className: "bg-[rgba(49,197,119,0.14)] text-(--color-status-available)" },
  FAILED:  { label: "Falhou",      className: "bg-[rgba(216,81,81,0.14)] text-(--color-status-busy)" },
};

type FilterType = "all" | "inactiveDays" | "serviceId" | "neverUsedServiceId";

// ── Toolbar ────────────────────────────────────────────────────────────────

type FormatAction = {
  label: ReactNode;
  title: string;
  wrap?: [string, string];
  prefix?: string;
};

const FORMAT_ACTIONS: FormatAction[] = [
  { label: <span className="font-bold">B</span>, title: "Negrito", wrap: ["*", "*"] },
  { label: <span className="italic font-serif">I</span>, title: "Itálico", wrap: ["_", "_"] },
  { label: <span className="line-through">S</span>, title: "Tachado", wrap: ["~", "~"] },
  { label: <span className="font-mono text-[0.65rem] font-bold">{"</>"}</span>, title: "Código", wrap: ["```\n", "\n```"] },
  { label: "—", title: "Separador" },
  { label: <span className="font-bold text-lg leading-none">•</span>, title: "Lista", prefix: "* " },
  { label: <span className="font-bold text-xs">1.</span>, title: "Numerada", prefix: "1. " },
  { label: <span className="font-serif font-bold text-lg leading-none">❝</span>, title: "Citação", prefix: "> " },
];

type ToolbarProps = {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
};

function Toolbar({ textareaRef, value, onChange }: ToolbarProps) {
  function applyFormat(action: FormatAction) {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);

    let newValue = value;
    let newStart = start;
    let newEnd = end;

    if (action.wrap) {
      const [open, close] = action.wrap;
      newValue = value.slice(0, start) + open + selected + close + value.slice(end);
      newStart = start + open.length;
      newEnd = newStart + selected.length;
    } else if (action.prefix) {
      if (selected) {
        // Aplica o prefixo em todas as linhas selecionadas
        const isNumeric = action.prefix.match(/(\d+)\.\s/);
        const modifiedSelection = selected
          .split("\n")
          .map((line, idx) => {
            if (!line.trim()) return line; // Ignora linhas em branco
            if (isNumeric) return `${idx + 1}. ${line}`; // Sequência inteligente
            return `${action.prefix}${line}`;
          })
          .join("\n");

        newValue = value.slice(0, start) + modifiedSelection + value.slice(end);
        newStart = start;
        newEnd = start + modifiedSelection.length;
      } else {
        // Aplica apenas na linha atual se não houver seleção
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        newValue = value.slice(0, lineStart) + action.prefix + value.slice(lineStart);
        newStart = start + action.prefix.length;
        newEnd = end + action.prefix.length;
      }
    }

    onChange(newValue);

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newStart, newEnd);
    });
  }

  return (
    <div className="flex flex-wrap gap-1 rounded-t-2xl border border-b-0 border-(--color-border-soft) bg-(--color-bg-dark)/80 px-3 py-2 items-center">
      {FORMAT_ACTIONS.map((action, i) =>
        action.title === "Separador" ? (
          <div key={i} className="mx-1 h-5 w-px self-center bg-(--color-border-soft)" />
        ) : (
          <button
            key={i}
            type="button"
            title={action.title}
            onClick={() => applyFormat(action)}
            className="flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm text-(--color-text-secondary) transition-colors hover:bg-(--color-accent)/10 hover:text-(--color-text-primary)"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────

export default function BroadcastPanel() {
  const { addToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [message, setMessage]               = useState("");
  const [filterType, setFilterType]         = useState<FilterType>("all");
  const [inactiveDays, setInactiveDays]     = useState("30");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [isSending, setIsSending]           = useState(false);
  const [broadcasts, setBroadcasts]         = useState<Broadcast[]>([]);
  const [services, setServices]             = useState<Service[]>([]);
  const [isLoading, setIsLoading]           = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const [bs, svs] = await Promise.all([listBroadcasts(), listServices()]);
      setBroadcasts(bs ?? []);
      setServices(svs ?? []);
    } catch {
      addToast({ title: "Falha ao carregar", description: "Não foi possível carregar os dados.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const hasRunning = broadcasts.some((b) => b.status === "RUNNING");
    if (!hasRunning) return;
    const interval = setInterval(async () => {
      try { setBroadcasts((await listBroadcasts()) ?? []); } catch { /* silencia */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [broadcasts]);

  function buildFilter(): BroadcastFilter {
    switch (filterType) {
      case "inactiveDays":       return { inactiveDays: Number(inactiveDays) || 30 };
      case "serviceId":          return { serviceId: selectedServiceId };
      case "neverUsedServiceId": return { neverUsedServiceId: selectedServiceId };
      default:                   return { all: true };
    }
  }

  async function handleSend() {
    if (!message.trim()) {
      addToast({ title: "Mensagem vazia", description: "Escreva a mensagem antes de enviar.", type: "error" });
      return;
    }
    if ((filterType === "serviceId" || filterType === "neverUsedServiceId") && !selectedServiceId) {
      addToast({ title: "Selecione um serviço", description: "Escolha o serviço para filtrar os clientes.", type: "error" });
      return;
    }
    try {
      setIsSending(true);
      await startBroadcast({ message: message.trim(), filter: buildFilter() });
      addToast({ title: "Broadcast iniciado", description: "As mensagens estão sendo enviadas.", type: "success" });
      setMessage("");
      setFilterType("all");
      setSelectedServiceId("");
      void load();
    } catch (err) {
      addToast({ title: "Falha ao iniciar", description: err instanceof Error ? err.message : "Tente novamente.", type: "error" });
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === "Enter") {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const currentLineStart = message.lastIndexOf("\n", start - 1) + 1;
        const currentLine = message.slice(currentLineStart, start);

        // Identifica se a linha atual começa com padrão de lista (ex: "* ", "- ", "1. ", "> ")
        const match = currentLine.match(/^(\s*(?:[-*]|>|\d+\.)\s+)/);

        if (match) {
          e.preventDefault(); // Impede o Enter padrão
          const prefix = match[1];

          // Se o usuário deu Enter numa linha vazia da lista, saímos dela (apagamos o prefixo)
          if (currentLine.trim() === prefix.trim()) {
            const newValue = message.slice(0, currentLineStart) + message.slice(start);
            setMessage(newValue);
            requestAnimationFrame(() => {
              el.setSelectionRange(currentLineStart, currentLineStart);
            });
            return;
          }

          // Continua a lista. Se for numerada, incrementa o número automaticamente
          let nextPrefix = prefix;
          const numericMatch = prefix.match(/^(\s*)(\d+)(\.\s+)/);
          if (numericMatch) {
            const nextNum = parseInt(numericMatch[2], 10) + 1;
            nextPrefix = `${numericMatch[1]}${nextNum}${numericMatch[3]}`;
          }

          const newValue = message.slice(0, start) + "\n" + nextPrefix + message.slice(start);
          setMessage(newValue);
          
          const newCursorPos = start + 1 + nextPrefix.length;
          requestAnimationFrame(() => {
            el.setSelectionRange(newCursorPos, newCursorPos);
          });
        }
      }
    }

  const needsService = filterType === "serviceId" || filterType === "neverUsedServiceId";

  return (
    <div className="mt-6 space-y-6">

      {/* ── Formulário ── */}
      <section className="rounded-3xl border border-(--color-border-soft) bg-(--color-bg-card)/80 p-5 shadow-[0_18px_40px_rgba(7,9,14,0.18)]">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
          Nova mensagem
        </h2>

        <div className="mt-3">
          <Toolbar textareaRef={textareaRef} value={message} onChange={setMessage} />
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite a mensagem que será enviada para os clientes..."
            rows={5}
            className="w-full resize-none rounded-b-2xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-secondary) focus:border-(--color-accent)"
          />
        </div>

        {/* Filtro */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
            Destinatários
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                { value: "all",               label: "Todos os clientes" },
                { value: "inactiveDays",       label: "Clientes inativos" },
                { value: "serviceId",          label: "Clientes que fizeram um serviço" },
                { value: "neverUsedServiceId", label: "Clientes que nunca fizeram um serviço" },
              ] as { value: FilterType; label: string }[]
            ).map((option) => (
              <label
                key={option.value}
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                  filterType === option.value
                    ? "border-(--color-accent) bg-(--color-accent)/10"
                    : "border-(--color-border-soft) bg-(--color-bg-dark)/50 hover:border-(--color-accent)/50",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="filterType"
                  value={option.value}
                  checked={filterType === option.value}
                  onChange={() => setFilterType(option.value)}
                  className="accent-(--color-accent)"
                />
                <span className="text-sm text-(--color-text-primary)">{option.label}</span>
              </label>
            ))}
          </div>

          {filterType === "inactiveDays" && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-(--color-text-secondary)">Sem agendamento há mais de</span>
              <input
                type="number"
                min={1}
                value={inactiveDays}
                onChange={(e) => setInactiveDays(e.target.value)}
                className="w-20 rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-3 py-2 text-center text-(--color-text-primary) outline-none focus:border-(--color-accent)"
              />
              <span className="text-sm text-(--color-text-secondary)">dias</span>
            </div>
          )}

          {needsService && (
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) outline-none focus:border-(--color-accent)"
            >
              <option value="">Selecione o serviço...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <Button onClick={() => void handleSend()} disabled={isSending}>
            {isSending ? "Enviando..." : "Enviar broadcast"}
          </Button>
        </div>
      </section>

      {/* ── Histórico ── */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
          Histórico
        </h2>

        {isLoading ? (
          <div className="rounded-3xl border border-(--color-border-soft) bg-(--color-bg-card) p-6 text-(--color-text-secondary)">
            Carregando histórico...
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-(--color-border-soft) bg-(--color-bg-card) p-8 text-center text-(--color-text-secondary)">
            Nenhum broadcast enviado ainda.
          </div>
        ) : (
          <div className="space-y-4">
            {broadcasts.map((broadcast) => {
              const status = STATUS_MAP[broadcast.status] ?? STATUS_MAP.FAILED!;
              return (
                <article
                  key={broadcast.id}
                  className="rounded-3xl border border-(--color-border-soft) bg-(--color-bg-card)/80 p-5 shadow-[0_18px_40px_rgba(7,9,14,0.18)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="flex-1 text-sm text-(--color-text-primary) line-clamp-2">
                      {broadcast.message}
                    </p>
                    <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-(--color-border-soft) bg-(--color-bg-dark)/50 px-4 py-3">
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">Enviados</p>
                      <p className="mt-1 text-base font-medium text-(--color-text-primary)">{broadcast.totalSent}</p>
                    </div>
                    <div className="rounded-2xl border border-(--color-border-soft) bg-(--color-bg-dark)/50 px-4 py-3">
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">Iniciado em</p>
                      <p className="mt-1 text-sm font-medium text-(--color-text-primary)">{formatDate(broadcast.createdAt)}</p>
                    </div>
                    {broadcast.finishedAt && (
                      <div className="rounded-2xl border border-(--color-border-soft) bg-(--color-bg-dark)/50 px-4 py-3">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">Finalizado em</p>
                        <p className="mt-1 text-sm font-medium text-(--color-text-primary)">{formatDate(broadcast.finishedAt)}</p>
                      </div>
                    )}
                  </div>

                  {broadcast.status === "RUNNING" && (
                    <div className="mt-4">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--color-bg-dark)">
                        <div
                          className="h-full rounded-full bg-(--color-accent) transition-all duration-500"
                          style={{ width: broadcast.totalSent > 0 ? "60%" : "10%" }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-(--color-text-secondary)">Enviando mensagens...</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
