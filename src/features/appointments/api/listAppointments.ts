import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { Appointment } from "@/types/appointment";

export async function listAppointments(): Promise<Appointment[]> {
  return apiFetch<Appointment[]>(`${API_BASE_URL}/appointments`, {
    cache: "no-store",
  });
}
