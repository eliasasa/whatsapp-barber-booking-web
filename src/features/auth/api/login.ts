import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { AuthResponse, LoginPayload } from "../types";

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
