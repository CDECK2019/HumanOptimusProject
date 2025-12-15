import React, { useState } from 'react';
import { UserProfile, Symptom, Intervention, Goal, Lab, Biometrics } from '../types';
import { Plus, Trash2, Activity, Pill, Target, TestTube, Scale } from 'lucide-react';

interface ProfileFormProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, setProfile }) => {
  const [activeTab, setActiveTab] = useState<keyof UserProfile>('symptoms');

  const updateBiometric = (field: keyof Biometrics, value: string) => {
    setProfile(prev => ({
      ...prev,
      biometrics: { ...prev.biometrics, [field]: value ? parseFloat(value) : undefined }
    }));
  };

  const addSymptom = () => {
    setProfile(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, { id: Date.now().toString(), name: '', severity: 3, duration_days: 0, notes: '' }]
    }));
  };

  const removeSymptom = (id: string) => {
    setProfile(prev => ({ ...prev, symptoms: prev.symptoms.filter(s => s.id !== id) }));
  };

  const addIntervention = () => {
    setProfile(prev => ({
      ...prev,
      interventions: [...prev.interventions, { id: Date.now().toString(), category: 'supplement', name: '' }]
    }));
  };

  const removeIntervention = (id: string) => {
    setProfile(prev => ({ ...prev, interventions: prev.interventions.filter(i => i.id !== id) }));
  };

  const addGoal = () => {
    setProfile(prev => ({
      ...prev,
      goals: [...prev.goals, { id: Date.now().toString(), description: '', priority: 'medium' }]
    }));
  };

  const removeGoal = (id: string) => {
    setProfile(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  };

  const addLab = () => {
    setProfile(prev => ({
      ...prev,
      labs: [...prev.labs, { id: Date.now().toString(), test_name: '', value: 0, unit: '' }]
    }));
  };

  const removeLab = (id: string) => {
    setProfile(prev => ({ ...prev, labs: prev.labs.filter(l => l.id !== id) }));
  };


  const tabs = [
    { id: 'symptoms', label: 'Symptoms', icon: <Activity size={18} /> },
    { id: 'interventions', label: 'Interventions', icon: <Pill size={18} /> },
    { id: 'goals', label: 'Goals', icon: <Target size={18} /> },
    { id: 'biometrics', label: 'Biometrics', icon: <Scale size={18} /> },
    { id: 'labs', label: 'Labs', icon: <TestTube size={18} /> },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ring-1 ring-slate-900/5">
      {/* Mobile Tab Select */}
      <div className="md:hidden p-4 border-b border-slate-200 bg-slate-50">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as keyof UserProfile)}
          className="w-full p-3 border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
        >
          {tabs.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:flex border-b border-slate-200 bg-slate-50/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as keyof UserProfile)}
            className={`flex-1 flex items-center justify-center gap-2 py-5 text-sm font-semibold transition-all relative overflow-hidden ${activeTab === tab.id
              ? 'text-indigo-700 bg-white'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
          >
            {/* Active Indicator Line */}
            {activeTab === tab.id && (
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-emerald-500" />
            )}
            <span className={activeTab === tab.id ? 'opacity-100' : 'opacity-70'}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8 min-h-[400px] bg-white">
        {/* SYMPTOMS TAB */}
        {activeTab === 'symptoms' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-display">What are you feeling?</h3>
                <p className="text-sm text-slate-500">Track physical and mental sensations.</p>
              </div>
              <button onClick={addSymptom} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold text-sm transition-colors border border-indigo-200/50">
                <Plus size={16} /> Add Symptom
              </button>
            </div>

            {profile.symptoms.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Activity className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-slate-500 font-medium">No symptoms tracked yet.</p>
              </div>
            )}

            <div className="grid gap-4">
              {profile.symptoms.map((sym, idx) => (
                <div key={sym.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
                  <div className="md:col-span-4">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1.5">Symptom Name</label>
                    <input
                      type="text"
                      name={`symptom-name-${idx}`}
                      autoComplete="off"
                      placeholder="e.g. Brain Fog"
                      className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      value={sym.name}
                      onChange={(e) => {
                        const newSyms = [...profile.symptoms];
                        newSyms[idx].name = e.target.value;
                        setProfile({ ...profile, symptoms: newSyms });
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1.5">Severity (1-5)</label>
                    <input
                      type="number"
                      name={`symptom-severity-${idx}`}
                      autoComplete="off"
                      min="1" max="5"
                      className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      value={sym.severity}
                      onChange={(e) => {
                        const newSyms = [...profile.symptoms];
                        newSyms[idx].severity = parseInt(e.target.value) || 1;
                        setProfile({ ...profile, symptoms: newSyms });
                      }}
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1.5">Notes / Duration</label>
                    <input
                      type="text"
                      name={`symptom-notes-${idx}`}
                      autoComplete="off"
                      placeholder="e.g. Worse in mornings, 3 weeks"
                      className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      value={sym.notes}
                      onChange={(e) => {
                        const newSyms = [...profile.symptoms];
                        newSyms[idx].notes = e.target.value;
                        setProfile({ ...profile, symptoms: newSyms });
                      }}
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-center pt-7">
                    <button onClick={() => removeSymptom(sym.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INTERVENTIONS TAB */}
        {activeTab === 'interventions' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-display">Supplements & Meds</h3>
                <p className="text-sm text-slate-500">Log your current protocol.</p>
              </div>
              <button onClick={addIntervention} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold text-sm transition-colors border border-indigo-200/50">
                <Plus size={16} /> Add Item
              </button>
            </div>

            {profile.interventions.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Pill className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-slate-500 font-medium">No interventions added.</p>
              </div>
            )}

            <div className="grid gap-4">
              {profile.interventions.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
                  <div className="md:col-span-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1.5">Category</label>
                    <div className="relative">
                      <select
                        value={item.category}
                        onChange={(e) => {
                          const list = [...profile.interventions];
                          list[idx].category = e.target.value as any;
                          setProfile({ ...profile, interventions: list });
                        }}
                        className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none"
                      >
                        <option value="supplement">Supplement</option>
                        <option value="medication">Medication</option>
                        <option value="diet">Diet</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                      </div>
                    </div>

                  </div>
                  <div className="md:col-span-4">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1.5">Name</label>
                    <input
                      type="text"
                      name={`intervention-name-${idx}`}
                      autoComplete="off"
                      placeholder="e.g. Magnesium Glycinate"
                      value={item.name}
                      onChange={(e) => {
                        const list = [...profile.interventions];
                        list[idx].name = e.target.value;
                        setProfile({ ...profile, interventions: list });
                      }}
                      className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1.5">Dose / Frequency</label>
                    <input
                      type="text"
                      name={`intervention-freq-${idx}`}
                      autoComplete="off"
                      placeholder="e.g. 400mg nightly"
                      value={item.frequency || ''}
                      onChange={(e) => {
                        const list = [...profile.interventions];
                        list[idx].frequency = e.target.value;
                        setProfile({ ...profile, interventions: list });
                      }}
                      className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-center pb-2">
                    <button onClick={() => removeIntervention(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GOALS TAB */}
        {activeTab === 'goals' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-display">Health Goals</h3>
                <p className="text-sm text-slate-500">What are your top priorities?</p>
              </div>
              <button onClick={addGoal} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold text-sm transition-colors border border-indigo-200/50">
                <Plus size={16} /> Add Goal
              </button>
            </div>

            {profile.goals.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Target className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-slate-500 font-medium">No goals set.</p>
              </div>
            )}

            <div className="grid gap-3">
              {profile.goals.map((goal, idx) => (
                <div key={goal.id} className="flex gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all items-center group">
                  <div className="flex-1">
                    <input
                      type="text"
                      name={`goal-desc-${idx}`}
                      autoComplete="off"
                      placeholder="e.g. Improve deep sleep to 90 min"
                      value={goal.description}
                      onChange={(e) => {
                        const list = [...profile.goals];
                        list[idx].description = e.target.value;
                        setProfile({ ...profile, goals: list });
                      }}
                      className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>
                  <div className="w-40">
                    <select
                      value={goal.priority}
                      onChange={(e) => {
                        const list = [...profile.goals];
                        list[idx].priority = e.target.value as any;
                        setProfile({ ...profile, goals: list });
                      }}
                      className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <button onClick={() => removeGoal(goal.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BIOMETRICS TAB */}
        {activeTab === 'biometrics' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900 font-display">Biometrics</h3>
              <p className="text-sm text-slate-500">Your core vital stats.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Age & Gender */}
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-500">Age</label>
                <input
                  type="number"
                  name="age"
                  autoComplete="age"
                  value={profile.biometrics.age || ''}
                  onChange={(e) => updateBiometric('age', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-500">Biological Sex</label>
                <select
                  value={profile.biometrics.gender || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    biometrics: { ...prev.biometrics, gender: e.target.value }
                  }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Height (Split Ft/In) */}
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-500">Height</label>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      name="height_ft"
                      autoComplete="off"
                      placeholder="0"
                      value={profile.biometrics.height_in ? Math.floor(profile.biometrics.height_in / 12) : ''}
                      onChange={(e) => {
                        const ft = parseInt(e.target.value) || 0;
                        const inch = (profile.biometrics.height_in || 0) % 12;
                        updateBiometric('height_in', (ft * 12 + inch).toString());
                      }}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                    <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">ft</span>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      name="height_in"
                      autoComplete="off"
                      placeholder="0"
                      max="11"
                      value={profile.biometrics.height_in ? Math.round(profile.biometrics.height_in % 12) : ''}
                      onChange={(e) => {
                        const inch = parseInt(e.target.value) || 0;
                        const ft = Math.floor((profile.biometrics.height_in || 0) / 12);
                        updateBiometric('height_in', (ft * 12 + inch).toString());
                      }}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                    <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">in</span>
                  </div>
                </div>
              </div>

              {/* Weight */}
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-500">Weight (lbs)</label>
                <input
                  type="number"
                  name="weight"
                  autoComplete="off"
                  value={profile.biometrics.weight_lbs || ''}
                  onChange={(e) => updateBiometric('weight_lbs', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Body Fat & BMI */}
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-500">Body Fat %</label>
                <input
                  type="number"
                  name="body_fat"
                  autoComplete="off"
                  value={profile.biometrics.body_fat || ''}
                  onChange={(e) => updateBiometric('body_fat', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-500">BMI (Auto)</label>
                <input
                  type="number"
                  name="bmi"
                  disabled
                  value={profile.biometrics.weight_lbs && profile.biometrics.height_in ? ((profile.biometrics.weight_lbs / (profile.biometrics.height_in * profile.biometrics.height_in)) * 703).toFixed(1) : ''}
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono"
                />
              </div>

              {/* Vitals */}
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-500">Systolic BP</label>
                <input
                  type="number"
                  name="bp_systolic"
                  autoComplete="off"
                  value={profile.biometrics.blood_pressure_systolic || ''}
                  onChange={(e) => updateBiometric('blood_pressure_systolic', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-500">Diastolic BP</label>
                <input
                  type="number"
                  name="bp_diastolic"
                  autoComplete="off"
                  value={profile.biometrics.blood_pressure_diastolic || ''}
                  onChange={(e) => updateBiometric('blood_pressure_diastolic', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* LABS TAB */}
        {activeTab === 'labs' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-display">Lab Results</h3>
                <p className="text-sm text-slate-500">Upload key biomarkers.</p>
              </div>
              <button onClick={addLab} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold text-sm transition-colors border border-indigo-200/50">
                <Plus size={16} /> Add Lab Value
              </button>
            </div>

            {profile.labs.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <TestTube className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-slate-500 font-medium">No lab data yet.</p>
              </div>
            )}

            <div className="grid gap-3">
              {profile.labs.map((lab, idx) => (
                <div key={lab.id} className="grid grid-cols-12 gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all items-end group">
                  <div className="col-span-4">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1.5">Test Name</label>
                    <input
                      type="text"
                      name={`lab-name-${idx}`}
                      autoComplete="off"
                      placeholder="e.g. Ferritin"
                      value={lab.test_name}
                      onChange={(e) => {
                        const list = [...profile.labs];
                        list[idx].test_name = e.target.value;
                        setProfile({ ...profile, labs: list });
                      }}
                      className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1.5">Value</label>
                    <input
                      type="number"
                      name={`lab-value-${idx}`}
                      autoComplete="off"
                      placeholder="30"
                      value={lab.value || ''}
                      onChange={(e) => {
                        const list = [...profile.labs];
                        list[idx].value = parseFloat(e.target.value);
                        setProfile({ ...profile, labs: list });
                      }}
                      className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1.5">Unit</label>
                    <input
                      type="text"
                      name={`lab-unit-${idx}`}
                      autoComplete="off"
                      placeholder="ng/mL"
                      value={lab.unit}
                      onChange={(e) => {
                        const list = [...profile.labs];
                        list[idx].unit = e.target.value;
                        setProfile({ ...profile, labs: list });
                      }}
                      className="w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center pb-2">
                    <button onClick={() => removeLab(lab.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
