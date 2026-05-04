import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";

export async function blockClient(id: string): Promise<void> {
  await apiFetch<void>(`${API_BASE_URL}/clients/${id}/block`, {
    method: "POST",
  });
}
