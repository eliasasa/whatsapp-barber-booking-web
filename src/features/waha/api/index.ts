import { apiFetch } from "@/lib/http";

// WAHA API client helpers

// Type definitions for WAHA responses
interface WahaServerStatus {
  status?: string;
  timestamp?: string;
  [key: string]: unknown;
}

interface WahaSession {
  name: string;
  status?: string;
  config?: Record<string, unknown>;
  me?: {
    id?: string;
    pushName?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface WahaSessionsResponse {
  sessions: WahaSession[];
  [key: string]: unknown;
}

interface WahaMe {
  id?: string;
  pushName?: string;
  number?: string;
  [key: string]: unknown;
}

interface WahaQrResponse {
  qr?: string;
  data?: string;
  [key: string]: unknown;
}

// API Functions
export async function getServerStatus(): Promise<WahaServerStatus> {
  return apiFetch(`/waha/server/status`);
}

export async function listSessions(): Promise<WahaSessionsResponse> {
  return apiFetch(`/waha/sessions`);
}

export async function getSession(session: string): Promise<WahaSession> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}`);
}

export async function getSessionMe(session: string): Promise<WahaMe> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}/me`);
}

export async function getSessionQr(session: string): Promise<WahaQrResponse> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}/qr`);
}

export async function startSession(session: string): Promise<Record<string, unknown>> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}/start`, {
    method: "POST",
  });
}

export async function stopSession(session: string): Promise<Record<string, unknown>> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}/stop`, {
    method: "POST",
  });
}

export async function restartSession(session: string): Promise<Record<string, unknown>> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}/restart`, {
    method: "POST",
  });
}

export async function logoutSession(session: string): Promise<Record<string, unknown>> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}/logout`, {
    method: "POST",
  });
}

export async function deleteSession(session: string): Promise<Record<string, unknown>> {
  return apiFetch(`/waha/sessions/${encodeURIComponent(session)}`, {
    method: "DELETE",
  });
}
