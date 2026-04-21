"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "./ToastContext";

const toastSamples = [
  {
    type: "success" as const,
    title: "Agendamento confirmado",
    description: "O atendimento foi salvo com sucesso.",
    label: "Sucesso",
  },
  {
    type: "error" as const,
    title: "Falha na operação",
    description: "Algo não saiu como esperado.",
    label: "Erro",
  },
  {
    type: "info" as const,
    title: "Informação útil",
    description: "Mostra um estado neutro para orientar o usuário.",
    label: "Info",
  },
  {
    type: "warning" as const,
    title: "Atenção necessária",
    description: "Esse estado pede uma leitura antes de seguir.",
    label: "Aviso",
  },
];

export function ToastTester() {
  const { addToast } = useToast();

  return (
    <div className="surface-panel grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
      {toastSamples.map((sample) => (
        <article
          key={sample.type}
          className="surface-card flex flex-col justify-between gap-4 p-4"
        >
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              {sample.label}
            </p>
            <h3 className="mt-2 text-base font-semibold text-[var(--color-text-primary)]">
              {sample.title}
            </h3>
            <p className="mt-2 text-sm leading-5 text-[var(--color-text-secondary)]">
              {sample.description}
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            variant={sample.type === "error" ? "danger" : sample.type === "warning" ? "outline" : "solid"}
            fullWidth
            onClick={() =>
              addToast({
                title: sample.title,
                description: sample.description,
                type: sample.type,
              })
            }
          >
            Testar {sample.label}
          </Button>
        </article>
      ))}
    </div>
  );
}