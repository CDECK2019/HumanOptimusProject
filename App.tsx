
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, CouncilResponse } from './types';
import { ProfileForm } from './components/ProfileForm';
import { CouncilView } from './components/CouncilView';
import { OpenRouterService } from './services/openRouterService';
import { DataService } from './services/dataService';
import { pb, isAuthenticated, logout } from './services/pocketbase';
import { AuthView } from './components/AuthView';
import { BrainCircuit, Loader2, Save, LogOut, Download, Upload, AlertTriangle } from 'lucide-react';

const INITIAL_PROFILE: UserProfile = {
  symptoms: [],
  interventions: [],
  goals: [],
  biometrics: {},
  labs: []
};

const App: React.FC = () => {
  const [user, setUser] = useState(pb.authStore.model);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<CouncilResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth State Listener
  useEffect(() => {
    return pb.authStore.onChange((token, model) => {
      setUser(model);
    });
  }, []);

  // Load Profile on Login
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const data = await DataService.getActiveSnapshot();
      setProfile(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load your profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleConsult = async () => {
    if (!query.trim()) {
      setError("Please enter a specific question or 'General Analysis'.");
      return;
    }

    // Auto-save before consulting
    await handleSave();

    setLoading(true);
    setError(null);
    const service = new OpenRouterService();

    try {
      const response = await service.consultCouncil(profile, query);
      setResult(response);
    } catch (err: any) {
      setError(err.message || "Failed to consult the council. Check your OpenRouter Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await DataService.saveProfile(profile);
      // Reload to get new IDs (e.g. for newly created symptoms)
      await loadProfileData();
    } catch (err: any) {
      console.error(err);
      setError("Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setQuery('');
    setError(null);
  };

  const handleLogout = () => {
    logout();
    setProfile(INITIAL_PROFILE);
    setResult(null);
  };

  // --- Data Export/Import (Legacy/Backup) ---
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "hoc-profile.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.symptoms && Array.isArray(json.symptoms)) {
          setProfile(json);
          // Note: Importing doesn't auto-save to backend to avoid accidental overwrites
          // User must click save
          setError(null);
        } else {
          setError("Invalid profile file format.");
        }
      } catch (err) {
        setError("Could not parse JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // 1. Auth View
  if (!user) {
    return <AuthView onAuthSuccess={() => { /* State updates via listener */ }} />;
  }

  // 2. Main App View
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">

      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        className="hidden"
        accept=".json"
      />

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500">
              H.O.C.
            </h1>
            <div className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-500 border border-slate-200">
              {user.email}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors border border-indigo-100"
              title="Save to Cloud"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save'}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {!result ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Build Your Health Profile</h2>
              <p className="text-slate-500">
                Data is securely stored in your personal PocketBase.
              </p>
            </div>

            <ProfileForm profile={profile} setProfile={setProfile} />

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky bottom-4 md:static z-40">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What would you like the Council to focus on?
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="e.g., 'Analyze my fatigue', 'Is my supplement stack safe?', or 'General checkup'"
                  className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConsult()}
                />
                <button
                  onClick={handleConsult}
                  disabled={loading}
                  className={`px - 8 py - 3 rounded - lg font - bold text - white shadow - md transition - all flex items - center justify - center gap - 2 min - w - [160px] ${loading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'
                    } `}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
                  {loading ? 'Convening...' : 'Consult Council'}
                </button>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center opacity-60 text-xs text-slate-400 mt-12">
              <div>Western Med (Mistral)</div>
              <div>Functional (Gemma)</div>
              <div>TCM (Llama 3.1)</div>
              <div>Pharmacist (Mistral)</div>
            </div>

          </div>
        ) : (
          <CouncilView data={result} onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default App;