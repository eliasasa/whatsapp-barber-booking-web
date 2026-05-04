import { apiFetch } from "@/lib/http";
import { API_BASE_URL } from "@/lib/config";

export async function restartBot(): Promise<void> {
  await apiFetch(`${API_BASE_URL}/bot/restart`, {
    method: "POST",
  });
}
