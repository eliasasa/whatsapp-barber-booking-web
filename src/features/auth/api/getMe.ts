import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { MeResponse } from "../types";

export async function getMe(token: string): Promise<MeResponse> {
  return apiFetch<MeResponse>(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
