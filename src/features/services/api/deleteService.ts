import { API_BASE_URL } from "@/lib/config";

export async function deleteService(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error (${response.status}): ${errorBody || response.statusText}`);
  }
}
