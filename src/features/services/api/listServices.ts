import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { Service } from "@/types/service";

export async function listServices(): Promise<Service[]> {
  return apiFetch<Service[]>(`${API_BASE_URL}/services`, {
    cache: "no-store",
  });
}
