import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { Appointment } from "@/types/appointment";

type CreateAppointmentPayload = {
  clientId: string;
  serviceId: string;
  startAt: string;
  address?: string;
  notes?: string;
};

export async function createAppointment(
  payload: CreateAppointmentPayload,
): Promise<Appointment> {
  return apiFetch<Appointment>(`${API_BASE_URL}/appointments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
