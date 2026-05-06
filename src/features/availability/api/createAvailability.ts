import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { AvailabilityItem } from "../types";

export type CreateAvailabilityPayload = {
  weekday: number;
  startTime: string;
  endTime: string;
};

export async function createAvailability(
  payload: CreateAvailabilityPayload,
): Promise<AvailabilityItem> {
  return apiFetch<AvailabilityItem>(`${API_BASE_URL}/availability`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
