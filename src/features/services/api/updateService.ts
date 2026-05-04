import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { Service } from "@/types/service";

export type UpdateServicePayload = {
  name?: string;
  duration?: number;
  price?: number | null;
  paused?: boolean;
};

export async function updateService(id: string, payload: UpdateServicePayload): Promise<Service> {
  return apiFetch<Service>(`${API_BASE_URL}/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
