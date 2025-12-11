import PocketBase from 'pocketbase';

// Default to localhost for self-hosted setup
// In production this would be an env var
const PB_URL = 'http://127.0.0.1:8090';

export const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

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
