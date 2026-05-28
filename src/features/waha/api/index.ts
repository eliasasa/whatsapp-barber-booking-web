import { apiFetch } from "@/lib/http";

// WAHA API client helpers

export async function getServerStatus(): Promise<any> {
  return apiFetch(`/waha/server/status`);
}

export async function listSessions(): Promise<any> {
  return apiFetch(`/waha/sessions`);
}

export async function getSession(session: string): Promise<any> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}`);
}

export async function getSessionMe(session: string): Promise<any> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}/me`);
}

export async function getSessionQr(session: string): Promise<any> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}/qr`);
}

export async function startSession(session: string): Promise<any> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}/start`, {
    method: "POST",
  });
}

export async function stopSession(session: string): Promise<any> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}/stop`, {
    method: "POST",
  });
}

export async function restartSession(session: string): Promise<any> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}/restart`, {
    method: "POST",
  });
}

export async function logoutSession(session: string): Promise<any> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}/logout`, {
    method: "POST",
  });
}

export async function deleteSession(session: string): Promise<any> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}`, {
    method: "DELETE",
  });
}

export default {
  getServerStatus,
  listSessions,
  getSession,
  getSessionMe,
  getSessionQr,
  startSession,
  stopSession,
  restartSession,
  logoutSession,
  deleteSession,
};
