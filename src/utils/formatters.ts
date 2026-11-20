import { Currency } from '../types';

export const DEFAULT_USD_IDR_RATE = 16350;
const LIVE_USD_RATE_STORAGE_KEY = 'chevilly_usd_rate';

let currentLiveUsdRate: number = (() => {
  if (typeof window !== 'undefined') {
    try {
      const saved = Number(localStorage.getItem(LIVE_USD_RATE_STORAGE_KEY));
      if (Number.isFinite(saved) && saved >= 5000 && saved <= 50000) {
        return Math.round(saved);
      }
    } catch {
      // ignore storage errors
    }
  }
  return DEFAULT_USD_IDR_RATE;
})();

export const getLiveUsdRate = (): number => currentLiveUsdRate;

export const setLiveUsdRate = (rate: number): void => {
  const rounded = Math.round(Number(rate));
  if (!Number.isFinite(rounded) || rounded < 1000) return;
  currentLiveUsdRate = rounded;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LIVE_USD_RATE_STORAGE_KEY, String(rounded));
    } catch {
      // ignore storage errors
    }
    window.dispatchEvent(new CustomEvent('chevilly-usd-rate-updated', { detail: rounded }));
  }
};

export const idrToLiveUsd = (amountIdr: number, rate?: number): number => {
  const numericIdr = Number(amountIdr);
  if (!Number.isFinite(numericIdr) || numericIdr <= 0) return 0;
  const effectiveRate = rate && rate >= 1000 ? rate : currentLiveUsdRate;
  return Math.max(1, Math.round(numericIdr / effectiveRate));
};

export const formatPrice = (amountIdr: number, amountUsd: number, currency: Currency): string => {
  if (currency === 'USD') {
    const liveUsd = Number(amountIdr) > 0 ? idrToLiveUsd(amountIdr) : Number(amountUsd) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(liveUsd);
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(amountIdr) || 0);
};

export const formatDateIndonesian = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const calculateNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 1;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diffTime = outDate.getTime() - inDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};
