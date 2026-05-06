export const WEEKDAY_OPTIONS = [
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
] as const;

export function formatDateTimeLocal(value: string) {
  if (!value) return "";
  return value.slice(0, 16);
}

export function toApiDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

export function formatTimeToInput(value: string) {
  if (!value) return "";
  return value.slice(0, 5);
}

export function toApiTime(value: string) {
  return value.length === 5 ? `${value}:00` : value;
}
