/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_PROXY_TARGET: string;
  readonly VITE_DEMO_ADMIN_EMAIL: string;
  readonly VITE_DEMO_ADMIN_PASSWORD: string;
  readonly VITE_DEMO_ADOPTER_EMAIL: string;
  readonly VITE_DEMO_ADOPTER_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
