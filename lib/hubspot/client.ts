const BASE_URL = "https://api.hubapi.com";

export async function hubspotFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`HubSpot API error ${res.status}: ${error}`);
  }

  return res.json();
}
