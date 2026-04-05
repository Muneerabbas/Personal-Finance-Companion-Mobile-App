import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchCurrencyNames, fetchUsdRates, type UsdRatesResponse } from '@/lib/currency-api';

const STORAGE_KEY = 'fintrack.selectedCurrency';

type CurrencyContextValue = {
  selectedCode: string;
  setSelectedCode: (code: string) => void;
  currencyNames: Record<string, string> | null;
  rates: Record<string, number> | null;
  ratesDate: string | null;
  loading: boolean;
  error: string | null;
  /** Stored amounts are USD; multiply by rate to get selected currency. */
  convertUsdToDisplay: (amountUsd: number) => number;
  /** User input in selected currency → USD for storage. */
  convertDisplayToUsd: (amountDisplay: number) => number;
  formatUsd: (amountUsd: number, options?: { minFrac?: number; maxFrac?: number; compact?: boolean }) => string;
  currencySymbol: string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function intlCurrencyCandidates(code: string): string[] {
  const u = code.toUpperCase();
  const list = [u];
  if (u.length > 3) list.push(u.slice(0, 3));
  return list;
}

function symbolForCode(code: string): string {
  for (const c of intlCurrencyCandidates(code)) {
    try {
      const parts = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: c,
      }).formatToParts(0);
      const sym = parts.find((p) => p.type === 'currency')?.value;
      if (sym) return sym;
    } catch {
      /* try next */
    }
  }
  return code.toUpperCase();
}

function formatWithIntl(
  value: number,
  code: string,
  minFrac: number,
  maxFrac: number,
): string {
  for (const c of intlCurrencyCandidates(code)) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: c,
        minimumFractionDigits: minFrac,
        maximumFractionDigits: maxFrac,
      }).format(value);
    } catch {
      /* try next */
    }
  }
  return `${code.toUpperCase()} ${value.toFixed(Math.min(maxFrac, 8))}`;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCode, setSelectedCodeState] = useState('usd');
  const [currencyNames, setCurrencyNames] = useState<Record<string, string> | null>(null);
  const [ratesPayload, setRatesPayload] = useState<UsdRatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rates = ratesPayload?.usd ?? null;
  const ratesDate = ratesPayload?.date ?? null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && stored) setSelectedCodeState(stored.toLowerCase());
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [names, usdRates] = await Promise.all([fetchCurrencyNames(), fetchUsdRates()]);
        if (cancelled) return;
        setCurrencyNames(names);
        setRatesPayload(usdRates);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load currencies');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSelectedCode = useCallback((code: string) => {
    const next = code.toLowerCase();
    setSelectedCodeState(next);
    void AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const rateForSelected = useMemo(() => {
    if (!rates) return 1;
    const r = rates[selectedCode.toLowerCase()];
    return typeof r === 'number' && Number.isFinite(r) && r !== 0 ? r : 1;
  }, [rates, selectedCode]);

  const convertUsdToDisplay = useCallback(
    (amountUsd: number) => {
      if (!rates) return amountUsd;
      const r = rates[selectedCode.toLowerCase()];
      if (typeof r !== 'number' || !Number.isFinite(r)) return amountUsd;
      return amountUsd * r;
    },
    [rates, selectedCode],
  );

  const convertDisplayToUsd = useCallback(
    (amountDisplay: number) => {
      if (!rates) return amountDisplay;
      const r = rates[selectedCode.toLowerCase()];
      if (typeof r !== 'number' || !Number.isFinite(r) || r === 0) return amountDisplay;
      return amountDisplay / r;
    },
    [rates, selectedCode],
  );

  const formatUsd = useCallback(
    (amountUsd: number, options?: { minFrac?: number; maxFrac?: number; compact?: boolean }) => {
      const minFrac = options?.minFrac ?? 2;
      const maxFrac = options?.maxFrac ?? 2;
      const compact = options?.compact ?? false;
      const display = convertUsdToDisplay(amountUsd);
      
      if (compact && Math.abs(display) >= 1000) {
        const absVal = Math.abs(display);
        const kVal = absVal / 1000;
        const sym = symbolForCode(selectedCode);
        const formatted = kVal >= 10 
          ? `${sym}${Math.round(kVal)}k`
          : `${sym}${kVal.toFixed(1).replace(/\.0$/, '')}k`;
        return display < 0 ? `-${formatted}` : formatted;
      }
      
      return formatWithIntl(display, selectedCode, minFrac, maxFrac);
    },
    [convertUsdToDisplay, selectedCode],
  );

  const currencySymbol = useMemo(() => symbolForCode(selectedCode), [selectedCode]);

  const value = useMemo(
    () => ({
      selectedCode,
      setSelectedCode,
      currencyNames,
      rates,
      ratesDate,
      loading,
      error,
      convertUsdToDisplay,
      convertDisplayToUsd,
      formatUsd,
      currencySymbol,
    }),
    [
      selectedCode,
      setSelectedCode,
      currencyNames,
      rates,
      ratesDate,
      loading,
      error,
      convertUsdToDisplay,
      convertDisplayToUsd,
      formatUsd,
      currencySymbol,
    ],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
