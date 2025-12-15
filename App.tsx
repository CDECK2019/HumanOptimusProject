
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, CouncilResponse } from './types';
import { ProfileForm } from './components/ProfileForm';
import { CouncilView } from './components/CouncilView';
import { ChatInterface } from './components/ChatInterface';
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
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
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
    setResult(null);
    setMessages([]);
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
    setMessages([]);
    setQuery('');
    setError(null);
  };

  const handleLogout = () => {
    logout();
    setProfile(INITIAL_PROFILE);
    setResult(null);
    setMessages([]);
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

  const handleChat = async (message: string) => {
    if (!result) return;

    // Add user message immediately
    const newMessages = [...messages, { role: 'user' as const, content: message }];
    setMessages(newMessages);
    setChatLoading(true);

    const service = new OpenRouterService();

    try {
      // Pass context: Profile string, Report object, History (previous messages), New Query
      const profileString = JSON.stringify(profile, null, 2);
      const aiResponse = await service.chatWithCouncil(profileString, result, messages, message);

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the Council right now. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // 1. Auth View
  if (!user) {
    return <AuthView onAuthSuccess={() => { /* State updates via listener */ }} />;
  }

  // 2. Main App View
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        className="hidden"
        accept=".json"
      />

      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-md sticky top-0 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/30">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                Health Optimus
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                AI Council
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-semibold text-slate-700">{user.email}</span>
              <span className="text-[10px] text-slate-400">Standard Plan</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />

            <button
              onClick={handleSave}
              disabled={saving}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-transparent border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition-all"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-12">

        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Health Council</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Consolidating insights from Western Medicine, Functional Health, TCM, and Behavioral Science into one unified plan.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 shadow-sm animate-in fade-in slide-in-from-top-4">
            <AlertTriangle className="shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Dynamic Content: Either Profile/Search OR Results */}
        {!result ? (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* Profile Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-white/40 overflow-hidden ring-1 ring-slate-900/5">
              <ProfileForm profile={profile} setProfile={setProfile} />
            </div>

            {/* Action Area */}
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-white rounded-xl shadow-lg border border-slate-100 flex items-center p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask your council (e.g., 'Optimize my sleep' or 'Review my blood work')..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-4 py-3 placeholder:text-slate-400 text-slate-700 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && !loading && handleConsult()}
                  />
                  <button
                    onClick={handleConsult}
                    disabled={loading}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        <span>Convening...</span>
                      </div>
                    ) : (
                      <span>Consult Council</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center opacity-60 text-xs text-slate-400 font-medium">
                <div>Western Med (Mistral)</div>
                <div>Functional (Gemma)</div>
                <div>TCM (Llama 3.1)</div>
                <div>Pharmacist (Mistral)</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold font-display text-slate-900">Council Findings</h3>
              <button
                onClick={handleReset}
                className="text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors"
              >
                Start New Session
              </button>
            </div>

            {/* 1. Static Report */}
            <CouncilView data={result} onReset={handleReset} />

            {/* 2. Interactive Chat */}
            <ChatInterface
              messages={messages}
              onSendMessage={handleChat}
              loading={chatLoading}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center text-slate-400 text-sm border-t border-slate-200/60 mt-20 bg-white/40">
        <p>&copy; {new Date().getFullYear()} Health Optimus AI. Privacy First & Self-Hosted.</p>
      </footer>
    </div>
  );
};

export default App;