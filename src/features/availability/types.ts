export type AvailabilityItem = {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
};

export type AvailabilityBlock = {
  id: string;
  startAt: string;
  endAt: string;
  reason?: string | null;
};
