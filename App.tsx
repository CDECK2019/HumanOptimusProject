import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { UserProfile, CouncilReport } from './types';
import { ProfileForm } from './components/ProfileForm';
import { OnboardingWizard } from './components/OnboardingWizard';
import { AppShell, type AppNavId } from './components/AppShell';
import { OverviewDashboard } from './components/OverviewDashboard';
import { CoachWorkspace } from './components/CoachWorkspace';
import { HabitsPanel } from './components/HabitsPanel';
import { InsightsPlaceholder } from './components/InsightsPlaceholder';
import { ProfileSettings } from './components/ProfileSettings';
import { OpenRouterService } from './services/openRouterService';
import { DataService } from './services/dataService';
import { pb, logout } from './services/pocketbase';
import { AuthView } from './components/AuthView';
import { DEV_AUTH_RECORD, isAuthBypass, useLocalDevProfile } from './services/authBypass';
import { downloadCouncilReportMarkdown } from './utils/councilReportExport';
import { CouncilReportStore } from './services/councilReportStore';
import { ReportsHistoryPanel } from './components/ReportsHistoryPanel';

const INITIAL_PROFILE: UserProfile = {
  symptoms: [],
  interventions: [],
  goals: [],
  biometrics: {},
  labs: [],
};

const DEFAULT_OVERVIEW_QUERY =
  'Give me a comprehensive council assessment of my profile: integrate every discipline, surface the top patterns and risks, and tell me the highest-leverage next moves.';

const App: React.FC = () => {
  const [user, setUser] = useState(() => {
    const m = pb.authStore.model;
    if (m) return m;
    if (isAuthBypass()) return DEV_AUTH_RECORD;
    return null;
  });
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [mainNav, setMainNav] = useState<AppNavId>('overview');
  const [wizardAppendLists, setWizardAppendLists] = useState(true);
  const [query, setQuery] = useState('');
  const [report, setReport] = useState<CouncilReport | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [consulting, setConsulting] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consultAbort = useRef<AbortController | null>(null);
  const chatAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    return pb.authStore.onChange((_token, model) => {
      if (model) setUser(model);
      else if (isAuthBypass()) setUser(DEV_AUTH_RECORD);
      else setUser(null);
    });
  }, []);

  const loadProfileData = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const data = await DataService.getActiveSnapshot();
      setProfile(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load your profile data.');
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void loadProfileData();
    }
  }, [user, loadProfileData]);

  // Cancel any in-flight council/chat requests on unmount.
  useEffect(() => {
    return () => {
      consultAbort.current?.abort();
      chatAbort.current?.abort();
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await DataService.saveProfile(profile);
      await loadProfileData();
    } catch (err) {
      console.error(err);
      setError('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const runConsult = useCallback(
    async (rawQuery: string) => {
      const finalQuery = rawQuery.trim();
      if (!finalQuery) {
        setError('Please enter a question or use the comprehensive assessment shortcut.');
        return;
      }

      // Persist any unsaved profile edits first.
      try {
        setSaving(true);
        await DataService.saveProfile(profile);
      } catch (err) {
        console.error(err);
        setError('Failed to save profile before consulting the council.');
        setSaving(false);
        return;
      } finally {
        setSaving(false);
      }

      consultAbort.current?.abort();
      const controller = new AbortController();
      consultAbort.current = controller;

      setConsulting(true);
      setError(null);
      setReport(null);
      setMessages([]);

      try {
        const service = new OpenRouterService();
        const result = await service.consultCouncil(profile, finalQuery, controller.signal);
        if (controller.signal.aborted) return;
        setReport(result);
        // Persist asynchronously — failures here never block the UX.
        void CouncilReportStore.save(result, profile.snapshot_id).catch((err) =>
          console.warn('Council report persistence failed:', err)
        );
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        const msg = err instanceof Error ? err.message : 'Council request failed.';
        setError(msg);
      } finally {
        if (!controller.signal.aborted) setConsulting(false);
      }
    },
    [profile]
  );

  const handleConsult = () => {
    void runConsult(query);
  };

  const handleGenerateReport = () => {
    console.info('[council] Generate report requested from Overview.');
    setMainNav('coach');
    const q = query.trim() || DEFAULT_OVERVIEW_QUERY;
    setQuery(q);
    void runConsult(q);
  };

  const handleReset = () => {
    consultAbort.current?.abort();
    chatAbort.current?.abort();
    setConsulting(false);
    setChatLoading(false);
    setReport(null);
    setMessages([]);
    setQuery('');
    setError(null);
  };

  const handleExportReport = () => {
    if (report) downloadCouncilReportMarkdown(report);
  };

  const handleLogout = () => {
    consultAbort.current?.abort();
    chatAbort.current?.abort();
    logout();
    if (isAuthBypass()) {
      setUser(DEV_AUTH_RECORD);
      void loadProfileData();
    } else {
      setUser(null);
      setProfile(INITIAL_PROFILE);
    }
    setReport(null);
    setMessages([]);
    setMainNav('overview');
    setWizardAppendLists(true);
  };

  const handleExportProfile = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'human-optimus-profile.json');
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImportJson = (json: UserProfile) => {
    setProfile(json);
    setError(null);
  };

  const handleOnboardingFinished = async (next: UserProfile) => {
    setProfile(next);
    await DataService.saveProfile(next);
    await loadProfileData();
    setMainNav('overview');
    setWizardAppendLists(true);
  };

  const handleRestartOnboarding = () => {
    setWizardAppendLists(false);
    setProfile((prev) => ({
      ...prev,
      onboarding_complete: false,
    }));
  };

  const handleChat = async (message: string) => {
    if (!report) return;

    const newMessages = [...messages, { role: 'user' as const, content: message }];
    setMessages(newMessages);
    setChatLoading(true);

    chatAbort.current?.abort();
    const controller = new AbortController();
    chatAbort.current = controller;

    try {
      const service = new OpenRouterService();
      const profileString = JSON.stringify(
        {
          symptoms: profile.symptoms,
          interventions: profile.interventions,
          goals: profile.goals,
          biometrics: profile.biometrics,
          labs: profile.labs,
          lifestyle_intake: profile.lifestyle_intake,
        },
        null,
        2
      );
      const aiResponse = await service.chatWithCouncil(
        profileString,
        report.synthesis,
        messages,
        message,
        controller.signal
      );
      if (controller.signal.aborted) return;
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble reaching the council right now. Please try again.",
        },
      ]);
    } finally {
      if (!controller.signal.aborted) setChatLoading(false);
    }
  };

  if (!user) {
    return <AuthView onAuthSuccess={() => {}} />;
  }

  if (loadingProfile && !profile.snapshot_id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8faf9] px-4 text-center font-medium text-slate-500">
        <p>Loading your workspace…</p>
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      </div>
    );
  }

  if (!profile.onboarding_complete) {
    return (
      <OnboardingWizard
        profile={profile}
        appendStructuredLists={wizardAppendLists}
        onFinished={handleOnboardingFinished}
      />
    );
  }

  let main: React.ReactNode = null;
  if (mainNav === 'overview') {
    main = (
      <OverviewDashboard
        profile={profile}
        onNavigate={setMainNav}
        onGenerateReport={handleGenerateReport}
        consulting={consulting}
      />
    );
  } else if (mainNav === 'coach') {
    main = (
      <CoachWorkspace
        profile={profile}
        setProfile={setProfile}
        query={query}
        setQuery={setQuery}
        report={report}
        messages={messages}
        loading={consulting}
        chatLoading={chatLoading}
        saving={saving}
        onConsult={handleConsult}
        onSave={handleSave}
        onReset={handleReset}
        onChat={handleChat}
        onExport={handleExportReport}
      />
    );
  } else if (mainNav === 'reports') {
    main = <ReportsHistoryPanel onGenerateNew={handleGenerateReport} />;
  } else if (mainNav === 'insights') {
    main = <InsightsPlaceholder profile={profile} />;
  } else if (mainNav === 'habits') {
    main = <HabitsPanel profile={profile} />;
  } else if (mainNav === 'body') {
    main = (
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Body & vitals</p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-slate-900">Structured data</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            The same editor the coach uses. Save before switching tabs.
          </p>
        </header>
        <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-xl shadow-emerald-900/[0.06]">
          <ProfileForm profile={profile} setProfile={setProfile} />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    );
  } else {
    main = (
      <ProfileSettings
        userEmail={user.email}
        profile={profile}
        onExport={handleExportProfile}
        onImportJson={handleImportJson}
        onRestartOnboarding={handleRestartOnboarding}
      />
    );
  }

  return (
    <AppShell
      userEmail={user.email}
      profile={profile}
      active={mainNav}
      onNavigate={setMainNav}
      onLogout={handleLogout}
      devAuthBypass={useLocalDevProfile()}
      globalError={error}
      onDismissError={() => setError(null)}
    >
      {main}
    </AppShell>
  );
};

export default App;
