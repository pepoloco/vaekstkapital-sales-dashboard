<<<<<<< HEAD
const BASE = "https://api-eu1.hubspot.com"
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function hsGet(path: string, attempt = 0): Promise<any> {
  await sleep(100)
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      Accept: "application/json",
    },
    cache: "no-store",
  })
  if (res.status === 429 && attempt < 4) {
    await sleep(2000 * (attempt + 1))
    return hsGet(path, attempt + 1)
  }
  if (!res.ok) throw new Error(`HubSpot GET ${path} → ${res.status}`)
  return res.json()
}

export async function hsPost(path: string, body: object, attempt = 0): Promise<any> {
  await sleep(100)
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  if (res.status === 429 && attempt < 4) {
    await sleep(2000 * (attempt + 1))
    return hsPost(path, body, attempt + 1)
  }
  if (!res.ok) throw new Error(`HubSpot POST ${path} → ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function fetchAll(path: string, body: object): Promise<any[]> {
  const results: any[] = []
  let after: string | undefined
  do {
    const page: any = await hsPost(path, after ? { ...body, after } : body)
    results.push(...(page.results ?? []))
    after = page.paging?.next?.after
  } while (after)
  return results
=======
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
>>>>>>> 835103a4fbf78d0a460bcadcfa47078be90cb42b
}
