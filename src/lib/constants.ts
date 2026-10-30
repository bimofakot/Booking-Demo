export const OPEN_HOUR = 7;
export const CLOSE_HOUR = 21;
export const SLOT_HOURS = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, index) => OPEN_HOUR + index);
export const MAX_DURATION_HOURS = CLOSE_HOUR - OPEN_HOUR;
export const MAX_PENDING_BOOKINGS = 2;
export const PENDING_TTL_HOURS = 3;

const priceFromEnv = Number(import.meta.env.VITE_PRICE_PER_HOUR);
export const PRICE_PER_HOUR = Number.isFinite(priceFromEnv) && priceFromEnv > 0 ? priceFromEnv : 50_000;

export const VENUE_NAME = import.meta.env.VITE_VENUE_NAME?.trim() || 'GOR Badminton';

export const OWNER_WHATSAPP = import.meta.env.VITE_OWNER_WHATSAPP?.trim() || '628xxxxxxxxxx';

export const THEME_STORAGE_KEY = 'gor.v1.theme';
export const SOUND_STORAGE_KEY = 'gor.v1.sound';
