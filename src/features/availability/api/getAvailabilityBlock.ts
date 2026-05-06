import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { AvailabilityBlock } from "../types";

export async function getAvailabilityBlock(id: string): Promise<AvailabilityBlock> {
  return apiFetch<AvailabilityBlock>(`${API_BASE_URL}/availability-blocks/${id}`, {
    cache: "no-store",
  });
}
