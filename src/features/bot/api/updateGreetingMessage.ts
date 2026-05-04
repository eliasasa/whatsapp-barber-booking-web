import { apiFetch } from "@/lib/http";

export async function updateGreetingMessage(
  content: string,
): Promise<{ key: string; content: string }> {
  return apiFetch("/bot-messages/greeting", {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
}
