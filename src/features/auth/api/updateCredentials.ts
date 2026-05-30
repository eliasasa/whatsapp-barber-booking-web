import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { AuthResponse, UpdateCredentialsPayload } from "../types";

export async function updateCredentials(payload: UpdateCredentialsPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${API_BASE_URL}/auth/credentials`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    skipUnauthorizedRedirect: true,
  });
}