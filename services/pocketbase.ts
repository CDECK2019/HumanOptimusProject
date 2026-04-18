import PocketBase from 'pocketbase';

// Allow override via env (e.g. production deployments). Falls back to a local
// self-hosted server.
const PB_URL = (import.meta.env.VITE_POCKETBASE_URL as string | undefined) ?? 'http://127.0.0.1:8090';

export const pb = new PocketBase(PB_URL);
// PocketBase's default auto-cancellation behavior is desirable: it cancels
// duplicate in-flight requests to the same endpoint. We rely on it for the
// snapshot/profile reads where rapid re-renders can fire overlapping calls.

// Helper to check auth state
export const isAuthenticated = () => {
    return pb.authStore.isValid;
};

export const getCurrentUser = () => {
    return pb.authStore.record;
};

export const logout = () => {
    pb.authStore.clear();
};
