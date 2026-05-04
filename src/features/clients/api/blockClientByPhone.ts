import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { Client } from "@/types/client";

export async function blockClientByPhone(phone: string): Promise<Client> {
  return apiFetch<Client>(`${API_BASE_URL}/clients/block-by-phone`, {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}
