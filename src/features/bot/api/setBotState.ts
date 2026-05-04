import { apiFetch } from "@/lib/http";
import { API_BASE_URL } from "@/lib/config";
import type { BotState } from "./getBotState";

export async function setBotState(paused: boolean): Promise<BotState> {
  return apiFetch(`${API_BASE_URL}/bot/state`, {
    method: "PATCH",
    body: JSON.stringify({ paused }),
  });
}
