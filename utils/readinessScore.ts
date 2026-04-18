import type { UserProfile } from '../types';

export interface ReadinessBreakdown {
  readiness: number;
  dataDepth: number;
  consistencyHint: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Educational composite: how much structured context the app has (not a medical score). */
export function computeReadiness(profile: UserProfile): ReadinessBreakdown {
  let pts = 0;

  if (profile.onboarding_complete) pts += 32;
  if (profile.lifestyle_intake?.completedAt) pts += 10;

  const bio = profile.biometrics || {};
  if (bio.age) pts += 4;
  if (bio.height_in && bio.weight_lbs) pts += 8;
  if (bio.resting_heart_rate || (bio.blood_pressure_systolic && bio.blood_pressure_diastolic)) pts += 5;

  if (profile.goals.length) pts += Math.min(12, profile.goals.length * 4);
  if (profile.symptoms.length) pts += Math.min(10, profile.symptoms.length * 3);
  if (profile.interventions.length) pts += Math.min(10, profile.interventions.length * 2);
  if (profile.labs.length) pts += Math.min(12, profile.labs.length * 3);

  const readiness = clamp(Math.round(pts), 0, 100);

  let consistencyHint = 'Add goals and a few habits to strengthen your overview.';
  if (readiness >= 75) consistencyHint = 'Strong baseline. Small weekly check-ins keep this useful.';
  else if (readiness >= 45) consistencyHint = 'Good start. Labs and weekly rhythm details will sharpen guidance.';

  return {
    readiness,
    dataDepth: readiness,
    consistencyHint,
  };
}
