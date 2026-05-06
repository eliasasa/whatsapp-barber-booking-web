import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { AvailabilityBlock } from "../types";

export type UpdateAvailabilityBlockPayload = {
  startAt?: string;
  endAt?: string;
  reason?: string;
};

export async function updateAvailabilityBlock(
  id: string,
  payload: UpdateAvailabilityBlockPayload,
): Promise<AvailabilityBlock> {
  return apiFetch<AvailabilityBlock>(`${API_BASE_URL}/availability-blocks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
