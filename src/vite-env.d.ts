/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_MODE?: 'mock' | 'firebase';
  readonly VITE_OWNER_WHATSAPP?: string;
  readonly VITE_PRICE_PER_HOUR?: string;
  readonly VITE_VENUE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
