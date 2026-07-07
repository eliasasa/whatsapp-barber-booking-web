import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { BroadcastFilter } from "@/types/broadcast";

type StartBroadcastInput = {
  message: string;
  filter?: BroadcastFilter;
};

type StartBroadcastResponse = {
  id: string;
  message: string;
};

export async function startBroadcast(
  input: StartBroadcastInput
): Promise<StartBroadcastResponse> {
  return apiFetch<StartBroadcastResponse>(`${API_BASE_URL}/broadcast`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
