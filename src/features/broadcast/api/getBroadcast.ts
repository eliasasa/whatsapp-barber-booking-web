import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { BroadcastDetail } from "@/types/broadcast";

export async function getBroadcast(id: string): Promise<BroadcastDetail> {
  return apiFetch<BroadcastDetail>(`${API_BASE_URL}/broadcast/${id}`, {
    cache: "no-store",
  });
}
