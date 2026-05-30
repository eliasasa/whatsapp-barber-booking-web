import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { ResetPasswordRequestPayload } from "../types";

export async function requestPasswordReset(payload: ResetPasswordRequestPayload): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`${API_BASE_URL}/auth/reset-password/request`, {
    method: "POST",
    body: JSON.stringify(payload),
    skipUnauthorizedRedirect: true,
  });
}
