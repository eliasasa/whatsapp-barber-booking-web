import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { Broadcast } from "@/types/broadcast";

export async function listBroadcasts(): Promise<Broadcast[]> {
  return apiFetch<Broadcast[]>(`${API_BASE_URL}/broadcast`, {
    cache: "no-store",
  });
}
