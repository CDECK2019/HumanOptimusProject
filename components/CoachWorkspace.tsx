import React from 'react';
import { Loader2 } from 'lucide-react';
import { ProfileForm } from './ProfileForm';
import { CouncilView } from './CouncilView';
import { ChatInterface } from './ChatInterface';
import type { UserProfile, CouncilReport } from '../types';

interface CoachWorkspaceProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  query: string;
  setQuery: (q: string) => void;
  report: CouncilReport | null;
  messages: { role: 'user' | 'assistant'; content: string }[];
  loading: boolean;
  chatLoading: boolean;
  saving: boolean;
  onConsult: () => void;
  onSave: () => void;
  onReset: () => void;
  onChat: (message: string) => void;
  onExport: () => void;
}

export const CoachWorkspace: React.FC<CoachWorkspaceProps> = ({
  profile,
  setProfile,
  query,
  setQuery,
  report,
  messages,
  loading,
  chatLoading,
  saving,
  onConsult,
  onSave,
  onReset,
  onChat,
  onExport,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) onConsult();
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Coach</p>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          Ask your <span className="text-emerald-600">council</span>
        </h2>
        <p className="mt-3 max-w-2xl text-base font-medium text-slate-500">
          Your structured profile and onboarding context are pulled in before each run. Save when you tweak rows
          below.
        </p>
      </header>

      {!report ? (
        <div className="space-y-10">
          <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-xl shadow-emerald-900/[0.06] ring-1 ring-slate-900/[0.04]">
            <ProfileForm profile={profile} setProfile={setProfile} />
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Try "Optimize my sleep" or "Review my blood work" — Shift+Enter for newline.'
                  rows={2}
                  className="min-h-[64px] flex-1 resize-y rounded-xl border-0 bg-transparent px-4 py-3 text-base font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  onClick={onConsult}
                  disabled={loading}
                  className="self-stretch rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-500 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Convening…
                    </span>
                  ) : (
                    'Consult council'
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-400">
              <span>Western · Functional · TCM · Ayurveda · Pharmacist · Lifestyle · Diagnostics</span>
              <button
                type="button"
                onClick={onSave}
                disabled={saving || loading}
                className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <CouncilView report={report} onReset={onReset} onExport={onExport} />
          <ChatInterface messages={messages} onSendMessage={onChat} loading={chatLoading} />
        </div>
      )}
    </div>
  );
};
