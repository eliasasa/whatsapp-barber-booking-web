export type BroadcastStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

export type BroadcastFilter = {
  all?: boolean;
  inactiveDays?: number;
  serviceId?: string;
  neverUsedServiceId?: string;
};

export type Broadcast = {
  id: string;
  message: string;
  filter: string | null;
  totalSent: number;
  status: BroadcastStatus;
  createdAt: string;
  finishedAt: string | null;
};

export type BroadcastLog = {
  id: string;
  clientId: string;
  sentAt: string;
  client: {
    id: string;
    name: string | null;
    phone: string | null;
  };
};

export type BroadcastDetail = Broadcast & {
  logs: BroadcastLog[];
};
