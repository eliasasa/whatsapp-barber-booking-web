import { apiFetch } from "@/lib/http";
import { API_BASE_URL } from "@/lib/config";

export async function updateGreetingMessage(
  content: string,
): Promise<{ key: string; content: string }> {
  return apiFetch(`${API_BASE_URL}/bot-messages/greeting`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
}
