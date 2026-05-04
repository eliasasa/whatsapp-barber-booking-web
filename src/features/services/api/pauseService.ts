import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { Service } from "@/types/service";

export async function pauseService(id: string, pause: boolean): Promise<Service> {
  return apiFetch<Service>(`${API_BASE_URL}/services/${id}/pause`, {
    method: "POST",
    body: JSON.stringify({ pause }),
  });
}
