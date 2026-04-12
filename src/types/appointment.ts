export type AppointmentClient = {
  id?: string;
  name: string;
};

export type AppointmentService = {
  name: string;
};

export type Appointment = {
  id: string;
  startAt: string;
  status?: "CONFIRMED" | "CANCELED" | string;
  client: AppointmentClient | null;
  service: AppointmentService | null;
};
