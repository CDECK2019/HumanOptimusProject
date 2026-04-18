import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  Shield,
  LineChart,
  Footprints,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  emptyHealthIntake,
  type FocusDomain,
  type HealthIntake,
  type HealthProgram,
  type ProgramActivity,
  type StrainItem,
  type WeeklyHabit,
} from '../intakeTypes';
import type { UserProfile } from '../types';
import { mergeIntakeIntoStructuredProfile } from '../services/intakeMerge';

const BARRIER_OPTIONS = ['Cost', 'Time', 'Childcare', 'Transport', 'Language', 'Other'];

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function totalMovementHours(habits: WeeklyHabit[]) {
  return habits.reduce((sum, h) => sum + (Number.isFinite(h.hoursPerWeek) ? h.hoursPerWeek : 0), 0);
}

interface OnboardingWizardProps {
  profile: UserProfile;
  /** First-time setup appends domains/strains into structured lists; review mode only refreshes intake JSON + vitals. */
  appendStructuredLists: boolean;
  onFinished: (next: UserProfile) => Promise<void>;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  profile,
  appendStructuredLists,
  onFinished,
}) => {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [intake, setIntake] = useState<HealthIntake>(() => {
    if (profile.lifestyle_intake) {
      try {
        return JSON.parse(JSON.stringify(profile.lifestyle_intake)) as HealthIntake;
      } catch {
        return emptyHealthIntake();
      }
    }
    return emptyHealthIntake();
  });

  const progress = useMemo(() => Math.round((step / 10) * 100), [step]);

  const update = <K extends keyof HealthIntake>(key: K, value: HealthIntake[K]) => {
    setIntake((prev) => ({ ...prev, [key]: value }));
  };

  const toggleBarrier = (label: string) => {
    setIntake((prev) => {
      const cur = prev.careAccess.barriers;
      const has = cur.includes(label);
      return {
        ...prev,
        careAccess: {
          ...prev.careAccess,
          barriers: has ? cur.filter((x) => x !== label) : [...cur, label],
        },
      };
    });
  };

  const addDomain = () => {
    const row: FocusDomain = { id: uid(), label: '', kind: 'priority', intensity: 5 };
    setIntake((prev) => ({ ...prev, domains: [...prev.domains, row] }));
  };
  const removeDomain = (id: string) => {
    setIntake((prev) => ({ ...prev, domains: prev.domains.filter((d) => d.id !== id) }));
  };

  const addHabit = () => {
    const row: WeeklyHabit = { id: uid(), category: '', hoursPerWeek: 0 };
    setIntake((prev) => ({ ...prev, weeklyHabits: [...prev.weeklyHabits, row] }));
  };
  const removeHabit = (id: string) => {
    setIntake((prev) => ({ ...prev, weeklyHabits: prev.weeklyHabits.filter((h) => h.id !== id) }));
  };

  const addStrain = () => {
    const row: StrainItem = { id: uid(), area: '', severityOrFrequency: '', effortToManage: '' };
    setIntake((prev) => ({ ...prev, strains: { ...prev.strains, items: [...prev.strains.items, row] } }));
  };
  const removeStrain = (id: string) => {
    setIntake((prev) => ({
      ...prev,
      strains: { ...prev.strains, items: prev.strains.items.filter((s) => s.id !== id) },
    }));
  };

  const addProgram = () => {
    const p: HealthProgram = {
      id: uid(),
      name: '',
      type: '',
      activities: [{ id: uid(), label: '', targetFrequency: '', lastDone: '' }],
    };
    setIntake((prev) => ({ ...prev, programs: [...prev.programs, p] }));
  };
  const removeProgram = (id: string) => {
    setIntake((prev) => ({ ...prev, programs: prev.programs.filter((p) => p.id !== id) }));
  };

  const patchProgram = (id: string, patch: Partial<HealthProgram>) => {
    setIntake((prev) => ({
      ...prev,
      programs: prev.programs.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const addActivity = (programId: string) => {
    const act: ProgramActivity = { id: uid(), label: '', targetFrequency: '', lastDone: '' };
    setIntake((prev) => ({
      ...prev,
      programs: prev.programs.map((p) =>
        p.id === programId ? { ...p, activities: [...p.activities, act] } : p
      ),
    }));
  };

  const patchActivity = (programId: string, activityId: string, patch: Partial<ProgramActivity>) => {
    setIntake((prev) => ({
      ...prev,
      programs: prev.programs.map((p) =>
        p.id === programId
          ? {
              ...p,
              activities: p.activities.map((a) => (a.id === activityId ? { ...a, ...patch } : a)),
            }
          : p
      ),
    }));
  };

  const removeActivity = (programId: string, activityId: string) => {
    setIntake((prev) => ({
      ...prev,
      programs: prev.programs.map((p) =>
        p.id === programId
          ? { ...p, activities: p.activities.filter((a) => a.id !== activityId) }
          : p
      ),
    }));
  };

  const addCustomMetric = () => {
    setIntake((prev) => ({
      ...prev,
      baseline: {
        ...prev.baseline,
        customRows: [...prev.baseline.customRows, { id: uid(), name: '', value: '' }],
      },
    }));
  };

  const fieldClass =
    'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25';

  const labelClass = 'text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400';

  const finish = async () => {
    setBusy(true);
    try {
      const merged = mergeIntakeIntoStructuredProfile(profile, intake, {
        appendLists: appendStructuredLists,
      });
      await onFinished(merged);
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (step < 10) setStep((s) => s + 1);
    else void finish();
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const kicker = (
    <p className={`${labelClass} flex items-center gap-2 text-emerald-700/90`}>
      <Sparkles className="h-3.5 w-3.5" />
      Step {step} of 10
    </p>
  );

  // Soft validation: reasons we'd warn the user before letting them continue.
  // Returning [] means "no warnings".
  const stepWarnings = (s: number): string[] => {
    if (s === 2) {
      const c = intake.context;
      if (![c.ageRange, c.birthYear, c.gender, c.zip, c.household].some((v) => v.trim())) {
        return ['You have not added any context yet. Even an age range helps us tune copy.'];
      }
    }
    if (s === 6 && intake.domains.length === 0) {
      return ['Add at least one focus domain so the coach knows what to respect.'];
    }
    if (s === 7 && intake.weeklyHabits.length === 0) {
      return ['Logging at least one habit row makes the weekly view much more useful.'];
    }
    return [];
  };

  const warnings = stepWarnings(step);

  let body: React.ReactNode = null;
  if (step === 1) {
    body = (
      <div className="space-y-8">
        <div>
          {kicker}
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Welcome to <span className="text-slate-900">Human</span>{' '}
            <span className="text-emerald-600">Optimus</span>
          </h2>
          <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-slate-500">
            You get a calmer read on your patterns, a practical score for consistency (not a diagnosis),
            and next steps sized for real life.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: 'Personal intelligence',
              d: 'See how sleep, stress, and routines connect—without the noise.',
              icon: LineChart,
            },
            {
              t: 'Readiness signal',
              d: 'A simple data-depth score so you know what is still missing.',
              icon: Shield,
            },
            {
              t: 'Practical next steps',
              d: 'Small moves your coach can build on—not a life overhaul.',
              icon: Footprints,
            },
          ].map((c) => (
            <div
              key={c.t}
              className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-emerald-900/[0.04] ring-1 ring-slate-900/[0.04]"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{c.d}</p>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-6">
          <p className={labelClass}>What we will do</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm font-medium text-slate-600">
            <li>Profile and context</li>
            <li>Lifestyle and health map</li>
            <li>Your first overview when you finish</li>
          </ol>
        </div>
        <p className="text-sm font-medium text-slate-500">
          <span className="font-bold text-slate-700">Privacy:</span> structured answers sync to your
          account on your PocketBase server—treat this as self-hosted, not for resale.
        </p>
      </div>
    );
  } else if (step === 2) {
    body = (
      <div className="space-y-6">
        {kicker}
        <h2 className="font-display text-2xl font-black tracking-tight text-slate-900">You and your context</h2>
        <p className="text-sm font-medium text-slate-500">
          Optional where noted. ZIP or region helps us frame seasonality and environment—never for surveillance.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Age range</label>
            <input
              className={`${fieldClass} mt-2`}
              value={intake.context.ageRange}
              onChange={(e) => update('context', { ...intake.context, ageRange: e.target.value })}
              placeholder="e.g. 35–44"
            />
          </div>
          <div>
            <label className={labelClass}>Birth year (optional)</label>
            <input
              className={`${fieldClass} mt-2`}
              value={intake.context.birthYear}
              onChange={(e) => update('context', { ...intake.context, birthYear: e.target.value })}
              placeholder="1988"
            />
          </div>
          <div>
            <label className={labelClass}>How you describe your sex (optional)</label>
            <input
              className={`${fieldClass} mt-2`}
              value={intake.context.gender}
              onChange={(e) => update('context', { ...intake.context, gender: e.target.value })}
              placeholder="Optional — used only to tune copy and ranges"
            />
          </div>
          <div>
            <label className={labelClass}>ZIP or region</label>
            <input
              className={`${fieldClass} mt-2`}
              value={intake.context.zip}
              onChange={(e) => update('context', { ...intake.context, zip: e.target.value })}
              placeholder="94107 or Pacific Northwest"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Household you support (optional)</label>
            <input
              className={`${fieldClass} mt-2`}
              value={intake.context.household}
              onChange={(e) => update('context', { ...intake.context, household: e.target.value })}
              placeholder="Kids, parents, pets—whatever shapes your week"
            />
          </div>
        </div>
      </div>
    );
  } else if (step === 3) {
    body = (
      <div className="space-y-6">
        {kicker}
        <h2 className="font-display text-2xl font-black tracking-tight text-slate-900">Daily environment</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ['Living situation', 'living', intake.environment.living],
            ['Work pattern', 'workPattern', intake.environment.workPattern],
            ['Commute / movement', 'commute', intake.environment.commute],
            ['Food access', 'foodAccess', intake.environment.foodAccess],
          ].map(([label, key, val]) => (
            <div key={key as string}>
              <label className={labelClass}>{label}</label>
              <input
                className={`${fieldClass} mt-2`}
                value={val as string}
                onChange={(e) =>
                  update('environment', { ...intake.environment, [key]: e.target.value })
                }
                placeholder="Short answer is fine"
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className={labelClass}>Sleep environment comfort</label>
            <textarea
              className={`${fieldClass} mt-2 min-h-[88px] resize-y`}
              value={intake.environment.sleepEnv}
              onChange={(e) => update('environment', { ...intake.environment, sleepEnv: e.target.value })}
              placeholder="Noise, light, temperature—whatever matters to you"
            />
          </div>
        </div>
      </div>
    );
  } else if (step === 4) {
    body = (
      <div className="space-y-6">
        {kicker}
        <h2 className="font-display text-2xl font-black tracking-tight text-slate-900">Coverage and access</h2>
        <p className="text-sm font-medium text-slate-500">
          This steers reminders and pacing. We do not sell this to employers or insurers.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Coverage type</label>
            <input
              className={`${fieldClass} mt-2`}
              value={intake.careAccess.coverage}
              onChange={(e) => update('careAccess', { ...intake.careAccess, coverage: e.target.value })}
              placeholder="Insured / public / none / prefer not to say"
            />
          </div>
          <div>
            <label className={labelClass}>Primary care rhythm (optional)</label>
            <input
              className={`${fieldClass} mt-2`}
              value={intake.careAccess.lastPcp}
              onChange={(e) => update('careAccess', { ...intake.careAccess, lastPcp: e.target.value })}
              placeholder="Last routine visit timing"
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Barriers (tap all that apply)</label>
          <div className="mt-3 flex flex-wrap gap-2">
            {BARRIER_OPTIONS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => toggleBarrier(b)}
                className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                  intake.careAccess.barriers.includes(b)
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  } else if (step === 5) {
    body = (
      <div className="space-y-6">
        {kicker}
        <h2 className="font-display text-2xl font-black tracking-tight text-slate-900">Time and money you already invest</h2>
        <p className="text-sm font-medium text-slate-500">Rough buckets are enough. Spend is optional.</p>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ['Weekly time for movement', 'timeMovement', intake.investments.timeMovement],
            ['Sleep hygiene', 'timeSleep', intake.investments.timeSleep],
            ['Meal prep / planning', 'timeMeals', intake.investments.timeMeals],
          ].map(([label, key, val]) => (
            <div key={key as string}>
              <label className={labelClass}>{label}</label>
              <input
                className={`${fieldClass} mt-2`}
                value={val as string}
                onChange={(e) =>
                  update('investments', { ...intake.investments, [key]: e.target.value })
                }
                placeholder="e.g. 3 hours / week"
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className={labelClass}>Optional: monthly spend on health (apps, gym, therapy)</label>
            <input
              className={`${fieldClass} mt-2`}
              value={intake.investments.spendNote}
              onChange={(e) => update('investments', { ...intake.investments, spendNote: e.target.value })}
              placeholder="Skip if sensitive"
            />
          </div>
        </div>
      </div>
    );
  } else if (step === 6) {
    body = (
      <div className="space-y-6">
        {kicker}
        <h2 className="font-display text-2xl font-black tracking-tight text-slate-900">Focus domains</h2>
        <p className="text-sm font-medium text-slate-500">
          Name the life areas you want the app to respect. Intensity is 0–10 everywhere in this flow.
        </p>
        <div className="space-y-4">
          {intake.domains.map((d) => (
            <div
              key={d.id}
              className="grid gap-4 rounded-3xl border border-slate-100 bg-white/90 p-4 shadow-sm md:grid-cols-12 md:items-end"
            >
              <div className="md:col-span-5">
                <label className={labelClass}>Label</label>
                <input
                  className={`${fieldClass} mt-2`}
                  value={d.label}
                  onChange={(e) =>
                    setIntake((prev) => ({
                      ...prev,
                      domains: prev.domains.map((x) =>
                        x.id === d.id ? { ...x, label: e.target.value } : x
                      ),
                    }))
                  }
                  placeholder="Sleep, stress, nutrition…"
                />
              </div>
              <div className="md:col-span-3">
                <label className={labelClass}>Type</label>
                <select
                  className={`${fieldClass} mt-2`}
                  value={d.kind}
                  onChange={(e) =>
                    setIntake((prev) => ({
                      ...prev,
                      domains: prev.domains.map((x) =>
                        x.id === d.id ? { ...x, kind: e.target.value as FocusDomain['kind'] } : x
                      ),
                    }))
                  }
                >
                  <option value="priority">Priority</option>
                  <option value="concern">Concern</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className={labelClass}>Intensity (0–10)</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  className={`${fieldClass} mt-2`}
                  value={d.intensity}
                  onChange={(e) =>
                    setIntake((prev) => ({
                      ...prev,
                      domains: prev.domains.map((x) =>
                        x.id === d.id ? { ...x, intensity: Number(e.target.value) || 0 } : x
                      ),
                    }))
                  }
                />
              </div>
              <div className="flex justify-end md:col-span-1">
                <button
                  type="button"
                  onClick={() => removeDomain(d.id)}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove domain"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addDomain}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-emerald-200/80 bg-emerald-50/30 py-4 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
          >
            <Plus className="h-4 w-4" /> Add domain
          </button>
        </div>
      </div>
    );
  } else if (step === 7) {
    const hours = totalMovementHours(intake.weeklyHabits);
    body = (
      <div className="space-y-6">
        {kicker}
        <h2 className="font-display text-2xl font-black tracking-tight text-slate-900">Weekly rhythm</h2>
        <p className="text-sm font-medium text-slate-500">
          Honest estimates beat precision. Optional file import can arrive later—this is your manual baseline.
        </p>
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5">
          <p className={labelClass}>Total tracked hours / week</p>
          <p className="mt-2 font-display text-3xl font-black text-emerald-700">{hours.toFixed(1)}</p>
          <p className="mt-1 text-xs font-medium text-emerald-900/70">
            Sum of the hours column below — counts every category you log (movement, screens, caffeine, alcohol…).
          </p>
        </div>
        <div className="space-y-4">
          {intake.weeklyHabits.map((h) => (
            <div
              key={h.id}
              className="grid gap-4 rounded-3xl border border-slate-100 bg-white/90 p-4 shadow-sm md:grid-cols-12 md:items-end"
            >
              <div className="md:col-span-7">
                <label className={labelClass}>Category</label>
                <input
                  className={`${fieldClass} mt-2`}
                  value={h.category}
                  onChange={(e) =>
                    setIntake((prev) => ({
                      ...prev,
                      weeklyHabits: prev.weeklyHabits.map((x) =>
                        x.id === h.id ? { ...x, category: e.target.value } : x
                      ),
                    }))
                  }
                  placeholder="Movement, screens, alcohol, caffeine…"
                />
              </div>
              <div className="md:col-span-4">
                <label className={labelClass}>Hours / week</label>
                <input
                  type="number"
                  step="0.25"
                  min={0}
                  className={`${fieldClass} mt-2`}
                  value={h.hoursPerWeek}
                  onChange={(e) =>
                    setIntake((prev) => ({
                      ...prev,
                      weeklyHabits: prev.weeklyHabits.map((x) =>
                        x.id === h.id ? { ...x, hoursPerWeek: parseFloat(e.target.value) || 0 } : x
                      ),
                    }))
                  }
                />
              </div>
              <div className="flex justify-end md:col-span-1">
                <button
                  type="button"
                  onClick={() => removeHabit(h.id)}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove row"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addHabit}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-emerald-200/80 bg-emerald-50/30 py-4 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
          >
            <Plus className="h-4 w-4" /> Add row
          </button>
        </div>
      </div>
    );
  } else if (step === 8) {
    body = (
      <div className="space-y-6">
        {kicker}
        <h2 className="font-display text-2xl font-black tracking-tight text-slate-900">Body baseline</h2>
        <p className="text-sm font-medium text-slate-500">
          Everything optional. We use this to contextualize guidance—not to grade you.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ['Height (inches total)', 'heightIn', intake.baseline.heightIn],
            ['Weight (lbs)', 'weightLbs', intake.baseline.weightLbs],
            ['Waist (in, optional)', 'waistIn', intake.baseline.waistIn],
            ['Resting HR', 'rhr', intake.baseline.rhr],
            ['BP systolic', 'bpSys', intake.baseline.bpSys],
            ['BP diastolic', 'bpDia', intake.baseline.bpDia],
          ].map(([label, key, val]) => (
            <div key={key as string}>
              <label className={labelClass}>{label}</label>
              <input
                className={`${fieldClass} mt-2`}
                value={val as string}
                onChange={(e) =>
                  update('baseline', { ...intake.baseline, [key]: e.target.value })
                }
              />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <p className={labelClass}>Custom metrics</p>
          {intake.baseline.customRows.map((row) => (
            <div key={row.id} className="flex flex-wrap gap-3 md:flex-nowrap">
              <input
                className={`${fieldClass} min-w-[140px] flex-1`}
                placeholder="Name"
                value={row.name}
                onChange={(e) =>
                  setIntake((prev) => ({
                    ...prev,
                    baseline: {
                      ...prev.baseline,
                      customRows: prev.baseline.customRows.map((r) =>
                        r.id === row.id ? { ...r, name: e.target.value } : r
                      ),
                    },
                  }))
                }
              />
              <input
                className={`${fieldClass} min-w-[120px] flex-1`}
                placeholder="Value"
                value={row.value}
                onChange={(e) =>
                  setIntake((prev) => ({
                    ...prev,
                    baseline: {
                      ...prev.baseline,
                      customRows: prev.baseline.customRows.map((r) =>
                        r.id === row.id ? { ...r, value: e.target.value } : r
                      ),
                    },
                  }))
                }
              />
              <button
                type="button"
                className="rounded-2xl px-3 text-slate-400 hover:bg-red-50 hover:text-red-600"
                onClick={() =>
                  setIntake((prev) => ({
                    ...prev,
                    baseline: {
                      ...prev.baseline,
                      customRows: prev.baseline.customRows.filter((r) => r.id !== row.id),
                    },
                  }))
                }
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addCustomMetric}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-emerald-200/80 bg-emerald-50/30 py-3 text-sm font-bold text-emerald-800"
          >
            <Plus className="h-4 w-4" /> Add metric
          </button>
        </div>
      </div>
    );
  } else if (step === 9) {
    body = (
      <div className="space-y-6">
        {kicker}
        <h2 className="font-display text-2xl font-black tracking-tight text-slate-900">Strains and guardrails</h2>
        <p className="text-sm font-medium text-slate-500">
          Severity or frequency plus effort to manage—same scale idea as the rest of the wizard.
        </p>
        <div className="space-y-4">
          {intake.strains.items.map((s) => (
            <div
              key={s.id}
              className="grid gap-4 rounded-3xl border border-slate-100 bg-white/90 p-4 shadow-sm md:grid-cols-12 md:items-end"
            >
              <div className="md:col-span-4">
                <label className={labelClass}>Area</label>
                <input
                  className={`${fieldClass} mt-2`}
                  value={s.area}
                  onChange={(e) =>
                    setIntake((prev) => ({
                      ...prev,
                      strains: {
                        ...prev.strains,
                        items: prev.strains.items.map((x) =>
                          x.id === s.id ? { ...x, area: e.target.value } : x
                        ),
                      },
                    }))
                  }
                  placeholder="Pain, mood, workload…"
                />
              </div>
              <div className="md:col-span-3">
                <label className={labelClass}>Severity / frequency</label>
                <input
                  className={`${fieldClass} mt-2`}
                  value={s.severityOrFrequency}
                  onChange={(e) =>
                    setIntake((prev) => ({
                      ...prev,
                      strains: {
                        ...prev.strains,
                        items: prev.strains.items.map((x) =>
                          x.id === s.id ? { ...x, severityOrFrequency: e.target.value } : x
                        ),
                      },
                    }))
                  }
                />
              </div>
              <div className="md:col-span-4">
                <label className={labelClass}>Effort to manage</label>
                <input
                  className={`${fieldClass} mt-2`}
                  value={s.effortToManage}
                  onChange={(e) =>
                    setIntake((prev) => ({
                      ...prev,
                      strains: {
                        ...prev.strains,
                        items: prev.strains.items.map((x) =>
                          x.id === s.id ? { ...x, effortToManage: e.target.value } : x
                        ),
                      },
                    }))
                  }
                />
              </div>
              <div className="flex justify-end md:col-span-1">
                <button
                  type="button"
                  onClick={() => removeStrain(s.id)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addStrain}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-emerald-200/80 bg-emerald-50/30 py-4 text-sm font-bold text-emerald-800"
          >
            <Plus className="h-4 w-4" /> Add strain
          </button>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Allergies (short)</label>
            <textarea
              className={`${fieldClass} mt-2 min-h-[80px]`}
              value={intake.strains.allergies}
              onChange={(e) =>
                setIntake((prev) => ({ ...prev, strains: { ...prev.strains, allergies: e.target.value } }))
              }
            />
          </div>
          <div>
            <label className={labelClass}>Contraindications (short)</label>
            <textarea
              className={`${fieldClass} mt-2 min-h-[80px]`}
              value={intake.strains.contraindications}
              onChange={(e) =>
                setIntake((prev) => ({
                  ...prev,
                  strains: { ...prev.strains, contraindications: e.target.value },
                }))
              }
            />
          </div>
        </div>
      </div>
    );
  } else if (step === 10) {
    body = (
      <div className="space-y-6">
        {kicker}
        <h2 className="font-display text-2xl font-black tracking-tight text-slate-900">Programs and devices</h2>
        <p className="text-sm font-medium text-slate-500">
          PT blocks, apps, running plans—whatever you consider an active program.
        </p>
        <div className="space-y-8">
          {intake.programs.map((p) => (
            <div key={p.id} className="rounded-[2rem] border border-slate-100 bg-white/95 p-6 shadow-md">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div className="grid flex-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Program name</label>
                    <input
                      className={`${fieldClass} mt-2`}
                      value={p.name}
                      onChange={(e) => patchProgram(p.id, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Type</label>
                    <input
                      className={`${fieldClass} mt-2`}
                      value={p.type}
                      onChange={(e) => patchProgram(p.id, { type: e.target.value })}
                      placeholder="Cardio, strength, mental health app…"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeProgram(p.id)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                <p className={labelClass}>Activities</p>
                {p.activities.map((a) => (
                  <div key={a.id} className="grid gap-3 md:grid-cols-12 md:items-end">
                    <div className="md:col-span-4">
                      <input
                        className={fieldClass}
                        placeholder="Label"
                        value={a.label}
                        onChange={(e) => patchActivity(p.id, a.id, { label: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        className={fieldClass}
                        placeholder="Target frequency"
                        value={a.targetFrequency}
                        onChange={(e) => patchActivity(p.id, a.id, { targetFrequency: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-4">
                      <input
                        className={fieldClass}
                        placeholder="Last done / streak"
                        value={a.lastDone}
                        onChange={(e) => patchActivity(p.id, a.id, { lastDone: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end md:col-span-1">
                      <button
                        type="button"
                        onClick={() => removeActivity(p.id, a.id)}
                        className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addActivity(p.id)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-200 py-2 text-xs font-bold uppercase tracking-wide text-emerald-800"
                >
                  <Plus className="h-4 w-4" /> Add activity
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addProgram}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-emerald-200/80 bg-emerald-50/30 py-4 text-sm font-bold text-emerald-800"
          >
            <Plus className="h-4 w-4" /> Add program
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f8faf9] text-slate-800">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[20%] top-[-10%] h-[45vh] w-[45vh] rounded-full bg-emerald-400/15 blur-[120px]" />
        <div className="absolute -right-[15%] bottom-[-10%] h-[40vh] w-[40vh] rounded-full bg-emerald-500/10 blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 md:py-14">
        <header className="mb-8 text-center md:text-left">
          <p className={`${labelClass} text-slate-500`}>Your baseline</p>
          <h1 className="mt-2 font-display text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Guided setup — <span className="text-emerald-600">ten transparent steps</span>
          </h1>
        </header>

        <div className="mb-8">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_24px_80px_-24px_rgba(16,185,129,0.25)] ring-1 ring-slate-900/[0.04] backdrop-blur-md md:p-10">
          <div
            key={step}
            className="transition duration-700 ease-out animate-[hoFadeZoom_0.7s_ease-out_both]"
          >
            {body}
            {warnings.length > 0 && (
              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm font-medium text-amber-800">
                {warnings.map((w, i) => (
                  <p key={i}>{w}</p>
                ))}
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-700/80">
                  You can still continue.
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-10 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-slate-200/60 pt-8 md:flex-row md:items-center">
          <button
            type="button"
            onClick={back}
            disabled={step === 1 || busy}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:scale-[1.02] hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-60"
          >
            {step === 10 ? (busy ? 'Saving…' : 'Complete setup') : 'Continue'}
            {step < 10 && <ChevronRight className="h-4 w-4" />}
          </button>
        </footer>
      </div>
    </div>
  );
};
