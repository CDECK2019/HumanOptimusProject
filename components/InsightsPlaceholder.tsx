import React from 'react';
import { Lock } from 'lucide-react';
import { computeReadiness } from '../utils/readinessScore';
import type { UserProfile } from '../types';

interface InsightsPlaceholderProps {
  profile: UserProfile;
}

export const InsightsPlaceholder: React.FC<InsightsPlaceholderProps> = ({ profile }) => {
  const { readiness } = computeReadiness(profile);
  const unlocked = readiness >= 40;

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-700">
        <Lock className="h-8 w-8" />
      </div>
      <h2 className="font-display text-3xl font-black tracking-tight text-slate-900">Insights stay quiet until you have enough signal</h2>
      <p className="text-base font-medium leading-relaxed text-slate-500">
        {unlocked
          ? 'Threshold met. Trend views and exports can ship in the next iteration—your data is already being captured below the surface.'
          : `Bring readiness to 40+ (currently ${readiness}) with a few labs, goals, and coach sessions. Then this space unlocks automatically.`}
      </p>
    </div>
  );
};
