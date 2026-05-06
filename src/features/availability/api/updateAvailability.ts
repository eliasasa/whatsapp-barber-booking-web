import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { AvailabilityItem } from "../types";

export type UpdateAvailabilityPayload = {
  weekday?: number;
  startTime?: string;
  endTime?: string;
};

export async function updateAvailability(
  id: string,
  payload: UpdateAvailabilityPayload,
): Promise<AvailabilityItem> {
  return apiFetch<AvailabilityItem>(`${API_BASE_URL}/availability/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
