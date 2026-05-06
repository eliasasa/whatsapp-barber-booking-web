import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { AvailabilityBlock } from "../types";

export async function listAvailabilityBlocks(): Promise<AvailabilityBlock[]> {
  return apiFetch<AvailabilityBlock[]>(`${API_BASE_URL}/availability-blocks`, {
    cache: "no-store",
  });
}
