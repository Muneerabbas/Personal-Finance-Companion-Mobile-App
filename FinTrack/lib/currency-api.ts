const API_VERSION = 'v1';

function cdnUrl(endpoint: string) {
  return `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/${API_VERSION}/${endpoint}`;
}

function fallbackUrl(endpoint: string) {
  return `https://latest.currency-api.pages.dev/${API_VERSION}/${endpoint}`;
}

async function fetchJson<T>(endpoint: string): Promise<T> {
  const primary = cdnUrl(endpoint);
  try {
    const res = await fetch(primary);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch {
    const res = await fetch(fallbackUrl(endpoint));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  }
}

/** Code → display name (e.g. `{ "usd": "US Dollar", ... }`). */
export function fetchCurrencyNames(): Promise<Record<string, string>> {
  return fetchJson<Record<string, string>>('currencies.json');
}

/** USD base rates: `{ "date": "...", "usd": { "eur": 0.92, ... } }` — target units per 1 USD. */
export type UsdRatesResponse = {
  date: string;
  usd: Record<string, number>;
};

export function fetchUsdRates(): Promise<UsdRatesResponse> {
  return fetchJson<UsdRatesResponse>('currencies/usd.json');
}
