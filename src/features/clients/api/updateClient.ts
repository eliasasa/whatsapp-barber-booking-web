import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { Client } from "@/types/client";

export type UpdateClientPayload = {
    name: string;
    phone?: string | null;
    notes?: string | null;
};

export async function updateClient(
    id: string,
    payload: UpdateClientPayload,
): Promise<Client> {
    return apiFetch<Client>(`${API_BASE_URL}/clients/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}