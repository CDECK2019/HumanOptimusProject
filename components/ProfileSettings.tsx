import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import type { UserProfile } from '../types';

interface ProfileSettingsProps {
  userEmail?: string;
  profile: UserProfile;
  onExport: () => void;
  onImportJson: (json: UserProfile) => void;
  onRestartOnboarding: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userEmail,
  profile,
  onExport,
  onImportJson,
  onRestartOnboarding,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        if (json && Array.isArray(json.symptoms)) {
          onImportJson(json as UserProfile);
        } else {
          console.warn('Imported file did not look like a UserProfile (missing symptoms array).');
        }
      } catch (err) {
        console.warn('Failed to parse imported JSON:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Profile</p>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-slate-900">Account and data</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Edit symptoms, labs, biometrics and the rest under Body &amp; vitals. This page is for the data you own.
        </p>
      </header>

      <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-lg">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Signed in as</p>
        <p className="mt-2 font-medium text-slate-800">{userEmail ?? 'Unknown'}</p>
        <p className="mt-4 text-sm font-medium text-slate-500">
          Onboarding {profile.onboarding_complete ? 'complete' : 'in progress'} · Snapshot{' '}
          {profile.snapshot_id?.slice(0, 8) ?? '—'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={onExport}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-800"
        >
          <Download className="h-4 w-4" /> Export JSON backup
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-800"
        >
          <Upload className="h-4 w-4" /> Import JSON
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
      </div>

      <div className="rounded-[2rem] border border-amber-100 bg-amber-50/50 p-6">
        <p className="font-display text-lg font-bold text-slate-900">Redo guided setup</p>
        <p className="mt-2 text-sm font-medium text-slate-600">
          Opens the ten-step wizard again. Your structured lists stay unless you overwrite them in the merge step.
        </p>
        <button
          type="button"
          onClick={onRestartOnboarding}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
        >
          Review onboarding
        </button>
      </div>
    </div>
  );
};
