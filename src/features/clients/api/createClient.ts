import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { Client } from "@/types/client";

type CreateClientPayload = {
  name: string;
  phone?: string | null;
  notes?: string | null;
};

export async function createClient(payload: CreateClientPayload): Promise<Client> {
  return apiFetch<Client>(`${API_BASE_URL}/clients`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}