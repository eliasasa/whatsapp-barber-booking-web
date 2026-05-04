import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";

export async function unblockClient(id: string): Promise<void> {
  await apiFetch<void>(`${API_BASE_URL}/clients/${id}/unblock`, {
    method: "POST",
  });
}
