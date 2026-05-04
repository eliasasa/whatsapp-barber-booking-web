import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { Service } from "@/types/service";

export type CreateServicePayload = {
  name: string;
  duration: number;
  price?: number | null;
};

export async function createService(payload: CreateServicePayload): Promise<Service> {
  return apiFetch<Service>(`${API_BASE_URL}/services`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
