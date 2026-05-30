import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { AuthResponse, UpdateEmailPayload } from "../types";

export async function updateEmail(payload: UpdateEmailPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${API_BASE_URL}/auth/email`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    skipUnauthorizedRedirect: true,
  });
}