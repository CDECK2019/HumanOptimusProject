import type { RecordModel } from 'pocketbase';
import { pb } from './pocketbase';
import type { Tier, UserProfile } from '../types';
import { computeReadiness } from '../utils/readinessScore';

const DEV_PROFILE_LS = 'ho_dev_profile_v1';

/** When true and PocketBase has no valid session, the app uses a local profile (localStorage) and skips sign-in. */
export function isAuthBypass(): boolean {
  return import.meta.env.VITE_DEV_SKIP_AUTH === 'true';
}

/** Minimal record so `user.email` and shell UI work without PocketBase auth. */
export const DEV_AUTH_RECORD = {
  id: 'local_dev_user',
  email: 'dev@localhost',
  collectionId: '_pb_users_auth_',
  collectionName: 'users',
} as unknown as RecordModel;

function emptyProfile(): UserProfile {
  return {
    snapshot_id: 'local-dev',
    created_at: new Date().toISOString(),
    onboarding_complete: true,
    lifestyle_intake: null,
    symptoms: [],
    interventions: [],
    goals: [],
    biometrics: {},
    labs: [],
  };
}

function withTier(profile: UserProfile): UserProfile {
  const readiness = computeReadiness(profile).readiness;
  const tier = Math.min(4, Math.floor(readiness / 25)) as Tier;
  return { ...profile, tier };
}

export function loadDevProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(DEV_PROFILE_LS);
    if (raw) {
      const parsed = JSON.parse(raw) as UserProfile;
      return withTier({
        ...emptyProfile(),
        ...parsed,
        snapshot_id: parsed.snapshot_id || 'local-dev',
      });
    }
  } catch {
    /* ignore */
  }
  return withTier(emptyProfile());
}

export function persistDevProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(DEV_PROFILE_LS, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export function clearDevProfile(): void {
  localStorage.removeItem(DEV_PROFILE_LS);
}

export function useLocalDevProfile(): boolean {
  return isAuthBypass() && !pb.authStore.isValid;
}
