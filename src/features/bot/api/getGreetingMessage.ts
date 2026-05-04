import { apiFetch } from "@/lib/http";
import { API_BASE_URL } from "@/lib/config";

export async function getGreetingMessage(): Promise<{ key: string; content: string }> {
  return apiFetch(`${API_BASE_URL}/bot-messages/greeting`, {
    method: "GET",
  });
}
