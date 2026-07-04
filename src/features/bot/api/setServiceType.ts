import { apiFetch } from "@/lib/http";

export async function setServiceType(serviceType: "LOCAL" | "MOBILE"): Promise<{ serviceType: "LOCAL" | "MOBILE" }> {
  return apiFetch("/bot-config", {
    method: "PUT",
    body: JSON.stringify({ serviceType }),
  });
}