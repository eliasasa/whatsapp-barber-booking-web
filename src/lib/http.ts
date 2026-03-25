type RequestInitSafe = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] };
};

export async function apiFetch<T>(
  url: string,
  init?: RequestInitSafe,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `API error (${response.status}): ${errorBody || response.statusText}`,
    );
  }

  return (await response.json()) as T;
}
