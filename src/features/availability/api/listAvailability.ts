import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { AvailabilityItem } from "../types";

export async function listAvailability(): Promise<AvailabilityItem[]> {
  return apiFetch<AvailabilityItem[]>(`${API_BASE_URL}/availability`, {
    cache: "no-store",
  });
}
