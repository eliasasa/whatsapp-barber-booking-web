import { apiFetch } from "@/lib/http";

export async function getServiceType(): Promise<{ serviceType: "LOCAL" | "MOBILE" }> {
  return apiFetch("/bot-config");
}