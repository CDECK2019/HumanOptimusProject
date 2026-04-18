import React from 'react';
import { ArrowRight, ClipboardList, Loader2, Pill, Sparkles, Target, TestTube } from 'lucide-react';
import type { UserProfile } from '../types';
import { computeReadiness } from '../utils/readinessScore';
import type { AppNavId } from './AppShell';

interface OverviewDashboardProps {
  profile: UserProfile;
  onNavigate: (id: AppNavId) => void;
  onGenerateReport: () => void;
  consulting: boolean;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  profile,
  onNavigate,
  onGenerateReport,
  consulting,
}) => {
  const { readiness, consistencyHint } = computeReadiness(profile);
  const movementHours =
    profile.lifestyle_intake?.weeklyHabits?.reduce(
      (s, h) => s + (Number.isFinite(h.hoursPerWeek) ? h.hoursPerWeek : 0),
      0
    ) ?? 0;
  const reportReady = (profile.onboarding_complete ?? false) && readiness >= 25;

  const cards = [
    {
      label: 'Symptoms & loads',
      value: profile.symptoms.length,
      hint: 'What you are carrying week to week',
      icon: ClipboardList,
      tone: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Goals',
      value: profile.goals.length,
      hint: 'Priorities we will respect in guidance',
      icon: Target,
      tone: 'text-slate-800',
      bg: 'bg-white',
    },
    {
      label: 'Interventions',
      value: profile.interventions.length,
      hint: 'Meds, supplements, programs you listed',
      icon: Pill,
      tone: 'text-sky-800',
      bg: 'bg-sky-50/80',
    },
    {
      label: 'Labs',
      value: profile.labs.length,
      hint: 'Biomarkers you have typed in',
      icon: TestTube,
      tone: 'text-amber-800',
      bg: 'bg-amber-50/80',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Your overview</p>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          Clarity without the <span className="text-emerald-600">clinical chill</span>
        </h2>
        <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-slate-500">
          This page is your at-a-glance signal for how much structured context lives in Human Optimus—not a
          diagnosis. Add data over time; the readiness meter quietly follows.
        </p>
      </header>

      {/* Council Report hero — the primary post-onboarding CTA */}
      <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-8 shadow-xl shadow-emerald-900/[0.08] md:p-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              <Sparkles className="h-3 w-3" /> Council Report
            </div>
            <h3 className="mt-3 font-display text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Get a comprehensive assessment from every discipline
            </h3>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 md:text-base">
              Seven specialists — Western, Functional, TCM, Ayurveda, Pharmacist, Lifestyle, and Root Cause
              Diagnostics — each analyze your profile in parallel. The President synthesizes their findings into
              one unified report you can save and share.
            </p>
            {!reportReady && (
              <p className="mt-3 text-xs font-medium text-amber-700">
                Add a bit more profile context (readiness ≥ 25) to unlock the report. Currently {readiness}/100.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onGenerateReport}
            disabled={!reportReady || consulting}
            className="group inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-emerald-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none md:self-center"
          >
            {consulting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Convening council…
              </>
            ) : (
              <>
                Generate council report <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-[0_24px_80px_-28px_rgba(16,185,129,0.35)] lg:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700/80">Readiness</p>
          <p className="mt-4 font-display text-5xl font-black text-slate-900">{readiness}</p>
          <p className="text-sm font-medium text-slate-500">out of 100 · data depth index</p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${readiness}%` }}
            />
          </div>
          <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600">{consistencyHint}</p>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white/90 p-8 shadow-lg shadow-slate-200/40 lg:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Weekly tracked hours</p>
          <p className="mt-3 font-display text-2xl font-black text-slate-900">
            {movementHours.toFixed(1)} h / week
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Sum of every habit row you logged in onboarding (movement, screens, caffeine, etc.). Refine anytime
            under Habits.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('habits')}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Review habits <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-3xl border border-slate-100 p-6 shadow-md shadow-emerald-900/[0.03] ${c.bg}`}
          >
            <div className={`mb-4 inline-flex rounded-2xl p-2.5 ${c.tone} bg-white/80`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-black text-slate-900">{c.value}</p>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-slate-900 px-8 py-6 text-white shadow-xl">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/80">Or ask something specific</p>
          <p className="mt-2 font-display text-xl font-bold">Open the coach with a focused question.</p>
          <p className="mt-1 text-sm text-slate-300">
            Same council, same context — just narrower in scope (e.g. "Review my blood work").
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('coach')}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-black text-emerald-950 shadow-lg transition hover:bg-emerald-300"
        >
          Go to coach <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
