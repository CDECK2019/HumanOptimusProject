import React, { useState } from 'react';
import {
  ShieldCheck,
  Info,
  Microscope,
  AlertTriangle,
  FlaskConical,
  ArrowRight,
  Sparkles,
  Stethoscope,
  Leaf,
  Pill,
  Activity,
  Search,
  ChevronDown,
  Download,
  AlertCircle,
} from 'lucide-react';
import type { CouncilReport, CouncilDiscipline, ExpertReport } from '../types';

interface CouncilViewProps {
  report: CouncilReport;
  onReset: () => void;
  onExport?: () => void;
}

interface DisciplineMeta {
  label: string;
  short: string;
  icon: React.ElementType;
  accent: string;
  iconBg: string;
  iconText: string;
}

const DISCIPLINE_META: Record<CouncilDiscipline, DisciplineMeta> = {
  western: {
    label: 'Western Medicine',
    short: 'Allopathic / clinical guidelines',
    icon: Stethoscope,
    accent: 'border-sky-200',
    iconBg: 'bg-sky-50',
    iconText: 'text-sky-700',
  },
  functional: {
    label: 'Functional Medicine',
    short: 'Root-cause physiology + nutrition',
    icon: Microscope,
    accent: 'border-emerald-200',
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-700',
  },
  tcm: {
    label: 'Traditional Chinese Medicine',
    short: 'Pattern differentiation: Qi, Blood, Yin/Yang',
    icon: Leaf,
    accent: 'border-amber-200',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-700',
  },
  ayurveda: {
    label: 'Ayurveda',
    short: 'Doshas, agni, dinacharya',
    icon: Sparkles,
    accent: 'border-orange-200',
    iconBg: 'bg-orange-50',
    iconText: 'text-orange-700',
  },
  pharmacist: {
    label: 'Integrative Pharmacist',
    short: 'Dosing, interactions, supplement safety',
    icon: Pill,
    accent: 'border-indigo-200',
    iconBg: 'bg-indigo-50',
    iconText: 'text-indigo-700',
  },
  lifestyle: {
    label: 'Lifestyle Coach',
    short: 'Behavior, stress, sleep, sustainable habits',
    icon: Activity,
    accent: 'border-rose-200',
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-700',
  },
  root_cause: {
    label: 'Root Cause Analyst',
    short: 'Diagnostic prioritization, testing roadmap',
    icon: Search,
    accent: 'border-slate-200',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-700',
  },
};

const ExpertCard: React.FC<{ expert: ExpertReport; defaultOpen?: boolean }> = ({ expert, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const meta = DISCIPLINE_META[expert.discipline];
  const Icon = meta.icon;

  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${meta.accent}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
        aria-expanded={open}
      >
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.iconBg} ${meta.iconText}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-base font-bold text-slate-900">{meta.label}</p>
            {expert.failed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700">
                <AlertCircle className="h-3 w-3" /> Unavailable
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{meta.short}</p>
          <p className="mt-1 truncate font-mono text-[10px] text-slate-400">{expert.model}</p>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5">
          {expert.failed ? (
            <p className="text-sm font-medium text-rose-700">{expert.content}</p>
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{expert.content}</div>
          )}
        </div>
      )}
    </div>
  );
};

export const CouncilView: React.FC<CouncilViewProps> = ({ report, onReset, onExport }) => {
  const { synthesis: data, experts, generated_at, query } = report;
  const successCount = experts.filter((e) => !e.failed).length;
  const generatedDate = new Date(generated_at);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-8">
      {/* President's synthesis */}
      <div className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-xl shadow-emerald-900/[0.08]">
        <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />
        <div className="p-8 text-slate-900 md:p-10">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-700/80">Council Report</p>
                <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                  President's synthesis
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {generatedDate.toLocaleString()} · {successCount} of {experts.length} disciplines reporting
                </p>
              </div>
            </div>
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
              >
                <Download className="h-4 w-4" /> Export markdown
              </button>
            )}
          </div>

          {query && (
            <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Question posed</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{query}</p>
            </div>
          )}

          <div className="text-base leading-relaxed text-slate-700">{data.key_insights}</div>

          <div className="mt-8 flex flex-col items-stretch justify-between gap-4 border-t border-slate-100 pt-8 md:flex-row md:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Your next best step</p>
              <p className="mt-1 text-base font-semibold text-emerald-900">
                {data.next_best_step || 'No single next step surfaced — review the recommendations below.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500"
            >
              Start new session <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecommendationCard
          title="Immediate & safe"
          subtitle="Start today"
          icon={ShieldCheck}
          accent="emerald"
          items={data.recommendations?.immediate_safe ?? []}
          empty="No immediate actions recommended."
          numbered
        />
        <RecommendationCard
          title="Consider / discuss"
          subtitle="Subject to review"
          badge="Ask your clinician"
          icon={FlaskConical}
          accent="sky"
          items={data.recommendations?.consider ?? []}
          empty="No items to discuss."
        />
        <RecommendationCard
          title="Explore with testing"
          subtitle="Data required"
          icon={Microscope}
          accent="amber"
          items={data.recommendations?.explore_with_testing ?? []}
          empty="No further testing flagged."
        />
        <RecommendationCard
          title="Avoid / caution"
          subtitle="Potential risks"
          icon={AlertTriangle}
          accent="rose"
          items={data.recommendations?.avoid ?? []}
          empty="No specific cautions identified."
        />
      </div>

      {/* Council voices */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Council voices</p>
            <h3 className="mt-1 font-display text-2xl font-black tracking-tight text-slate-900">
              Each discipline's view
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Tap any expert to read their full standalone analysis. The synthesis above reconciles them.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {experts.map((expert) => (
            <ExpertCard key={expert.discipline} expert={expert} />
          ))}
        </div>
      </div>

      {/* Where experts differ */}
      {data.why_experts_differ && (
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50/80 p-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm">
              <Info className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-bold text-slate-900">Where the experts differ</h3>
              <blockquote className="mt-3 border-l-4 border-emerald-300 pl-4 text-base font-medium italic leading-relaxed text-slate-700">
                {data.why_experts_differ}
              </blockquote>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {data.disclaimer && (
        <p className="mx-auto max-w-2xl text-center text-xs font-medium leading-relaxed text-slate-500">
          {data.disclaimer}
        </p>
      )}
    </div>
  );
};

interface RecommendationCardProps {
  title: string;
  subtitle: string;
  badge?: string;
  icon: React.ElementType;
  accent: 'emerald' | 'sky' | 'amber' | 'rose';
  items: string[];
  empty: string;
  numbered?: boolean;
}

const ACCENT: Record<RecommendationCardProps['accent'], { border: string; bar: string; iconBg: string; iconText: string; subText: string; badgeBg: string; badgeText: string; numberBg: string; numberText: string; }> = {
  emerald: {
    border: 'border-emerald-100',
    bar: 'bg-emerald-500',
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-700',
    subText: 'text-emerald-700',
    badgeBg: 'bg-emerald-100 border-emerald-200',
    badgeText: 'text-emerald-700',
    numberBg: 'bg-emerald-100 border-emerald-200',
    numberText: 'text-emerald-700',
  },
  sky: {
    border: 'border-sky-100',
    bar: 'bg-sky-500',
    iconBg: 'bg-sky-50',
    iconText: 'text-sky-700',
    subText: 'text-sky-700',
    badgeBg: 'bg-sky-100 border-sky-200',
    badgeText: 'text-sky-700',
    numberBg: 'bg-sky-100 border-sky-200',
    numberText: 'text-sky-700',
  },
  amber: {
    border: 'border-amber-100',
    bar: 'bg-amber-500',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-700',
    subText: 'text-amber-700',
    badgeBg: 'bg-amber-100 border-amber-200',
    badgeText: 'text-amber-700',
    numberBg: 'bg-amber-100 border-amber-200',
    numberText: 'text-amber-700',
  },
  rose: {
    border: 'border-rose-100',
    bar: 'bg-rose-500',
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-700',
    subText: 'text-rose-700',
    badgeBg: 'bg-rose-100 border-rose-200',
    badgeText: 'text-rose-700',
    numberBg: 'bg-rose-100 border-rose-200',
    numberText: 'text-rose-700',
  },
};

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  subtitle,
  badge,
  icon: Icon,
  accent,
  items,
  empty,
  numbered = false,
}) => {
  const a = ACCENT[accent];
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-white p-7 shadow-sm transition ${a.border}`}>
      <div className={`absolute left-0 top-0 h-full w-1.5 ${a.bar}`} />
      <div className="mb-6 flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${a.border} ${a.iconBg} ${a.iconText}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-2 font-display text-xl font-bold text-slate-900">
            {title}
            {badge && (
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${a.badgeBg} ${a.badgeText}`}>
                {badge}
              </span>
            )}
          </h3>
          <p className={`text-[11px] font-bold uppercase tracking-widest ${a.subText}`}>{subtitle}</p>
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-4">
          {items.map((rec, i) => (
            <li key={i} className="flex items-start gap-4">
              {numbered ? (
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${a.numberBg} ${a.numberText}`}>
                  {i + 1}
                </div>
              ) : (
                <div className={`mt-2 h-2 w-2 shrink-0 rounded-full ${a.bar}`} />
              )}
              <span className="text-sm leading-relaxed text-slate-700">{rec}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm italic text-slate-400">{empty}</p>
      )}
    </div>
  );
};
