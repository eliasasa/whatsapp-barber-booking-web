import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { AuthResponse, ResetPasswordPayload } from "../types";

export async function resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    body: JSON.stringify(payload),
    skipUnauthorizedRedirect: true,
  });
}
