import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { AvailabilityBlock } from "../types";

export type CreateAvailabilityBlockPayload = {
  startAt: string;
  endAt: string;
  reason?: string;
};

export async function createAvailabilityBlock(
  payload: CreateAvailabilityBlockPayload,
): Promise<AvailabilityBlock> {
  return apiFetch<AvailabilityBlock>(`${API_BASE_URL}/availability-blocks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
