import { apiFetch } from "@/lib/http";

export async function getGreetingMessage(): Promise<{ key: string; content: string }> {
  return apiFetch("/bot/greeting", {
    method: "GET",
  });
}
