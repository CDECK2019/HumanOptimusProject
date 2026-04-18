/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_OPENROUTER_API_KEY: string;
    /** Override the PocketBase server URL (defaults to http://127.0.0.1:8090). */
    readonly VITE_POCKETBASE_URL?: string;
    /** Set to "true" to skip sign-in and use localStorage-backed profile (dev only). */
    readonly VITE_DEV_SKIP_AUTH?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
