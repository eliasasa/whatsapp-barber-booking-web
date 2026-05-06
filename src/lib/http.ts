type RequestInitSafe = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] };
};

function getAuthToken(): string | null {
  // Only runs in client environment
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  url: string,
  init?: RequestInitSafe,
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(typeof init?.headers === "object" && init?.headers !== null
      ? (init.headers as Record<string, string>)
      : {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `API error (${response.status}): ${errorBody || response.statusText}`,
    );
  }

  return (await response.json()) as T;
}
