import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";

export async function deleteAppointment(id: string): Promise<void> {
  await apiFetch<void>(`${API_BASE_URL}/appointments/${id}`, {
    method: "DELETE",
  });
}
