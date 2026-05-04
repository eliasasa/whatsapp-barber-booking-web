import { apiFetch } from "@/lib/http";
import { API_BASE_URL } from "@/lib/config";

export type BotState = {
  paused: boolean;
};

export async function getBotState(): Promise<BotState> {
  return apiFetch(`${API_BASE_URL}/bot/state`, {
    method: "GET",
  });
}
