import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { AvailabilityItem } from "../types";

export async function getAvailability(id: string): Promise<AvailabilityItem> {
  return apiFetch<AvailabilityItem>(`${API_BASE_URL}/availability/${id}`, {
    cache: "no-store",
  });
}
