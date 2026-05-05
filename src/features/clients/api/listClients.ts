import { apiFetch } from "../../../lib/http";
import { API_BASE_URL } from "../../../lib/config";
import { Client } from "../../../types/client";

export async function listClients(): Promise<Client[]> {
  return apiFetch<Client[]>(`${API_BASE_URL}/clients`, {
    cache: "no-store",
  });
}
