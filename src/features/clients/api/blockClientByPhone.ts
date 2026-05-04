import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/http";
import type { Client } from "@/types/client";

export type BlockClientByPhonePayload = {
  phone: string;
  botDisabled?: boolean;
  name?: string;
  notes?: string;
};

export async function blockClientByPhone(
  payload: BlockClientByPhonePayload | string,
): Promise<Client> {
  const body =
    typeof payload === "string"
      ? { phone: payload, botDisabled: true }
      : { botDisabled: true, ...payload };

  return apiFetch<Client>(`${API_BASE_URL}/clients/block-by-phone`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
