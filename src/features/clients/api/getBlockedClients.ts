import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { Client } from "@/types/client";

export async function getBlockedClients(): Promise<Client[]> {
  return apiFetch<Client[]>(`${API_BASE_URL}/clients/blocked`);
}
