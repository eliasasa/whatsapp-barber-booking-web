import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { Appointment } from "@/types/appointment";

type ReschedulePayload = {
  newStartAt: string;
};

export async function rescheduleAppointment(
  id: string,
  payload: ReschedulePayload,
): Promise<Appointment> {
  return apiFetch<Appointment>(`${API_BASE_URL}/appointments/${id}/reschedule`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}