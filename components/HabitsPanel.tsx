import React from 'react';
import type { UserProfile } from '../types';

interface HabitsPanelProps {
  profile: UserProfile;
}

export const HabitsPanel: React.FC<HabitsPanelProps> = ({ profile }) => {
  const habits = profile.lifestyle_intake?.weeklyHabits ?? [];
  const total = habits.reduce((s, h) => s + (Number.isFinite(h.hoursPerWeek) ? h.hoursPerWeek : 0), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Habits</p>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-slate-900">Weekly rhythm</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Pulled from your onboarding. Re-run setup from Profile if your week changes materially.
        </p>
      </header>

      <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50/40 p-6 shadow-inner">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800/80">Reported hours / week</p>
        <p className="mt-2 font-display text-4xl font-black text-emerald-800">{total.toFixed(1)}</p>
      </div>

      <div className="space-y-3">
        {habits.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-sm font-medium text-slate-500">
            No habit rows yet. Complete onboarding or add them in a future edit pass.
          </p>
        )}
        {habits.map((h) => (
          <div
            key={h.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div>
              <p className="font-display text-lg font-bold text-slate-900">{h.category || 'Untitled'}</p>
              <p className="text-xs font-medium text-slate-500">Self-reported bucket</p>
            </div>
            <p className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-black text-emerald-800">
              {h.hoursPerWeek} h / wk
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
