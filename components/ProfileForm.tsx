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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Mobile Tab Select */}
      <div className="md:hidden p-4 border-b border-slate-200">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as keyof UserProfile)}
          className="w-full p-2 border border-slate-300 rounded-md"
        >
          {tabs.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:flex border-b border-slate-200 bg-slate-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as keyof UserProfile)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 min-h-[400px]">
        {/* SYMPTOMS TAB */}
        {activeTab === 'symptoms' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">What are you feeling?</h3>
              <button onClick={addSymptom} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                <Plus size={16} /> Add Symptom
              </button>
            </div>
            {profile.symptoms.length === 0 && <p className="text-slate-400 italic text-center py-8">No symptoms added.</p>}
            {profile.symptoms.map((sym, idx) => (
              <div key={sym.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-4 bg-slate-50 rounded-lg border border-slate-100 relative group">
                <div className="md:col-span-4">
                  <label className="text-xs text-slate-500 block mb-1">Symptom Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Brain Fog"
                    className="w-full p-2 rounded border border-slate-300 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    value={sym.name}
                    onChange={(e) => {
                      const newSyms = [...profile.symptoms];
                      newSyms[idx].name = e.target.value;
                      setProfile({ ...profile, symptoms: newSyms });
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-500 block mb-1">Severity (1-5)</label>
                  <input
                    type="number"
                    min="1" max="5"
                    className="w-full p-2 rounded border border-slate-300 text-sm"
                    value={sym.severity}
                    onChange={(e) => {
                      const newSyms = [...profile.symptoms];
                      newSyms[idx].severity = parseInt(e.target.value) || 1;
                      setProfile({ ...profile, symptoms: newSyms });
                    }}
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="text-xs text-slate-500 block mb-1">Notes / Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. Worse in mornings, 3 weeks"
                    className="w-full p-2 rounded border border-slate-300 text-sm"
                    value={sym.notes}
                    onChange={(e) => {
                      const newSyms = [...profile.symptoms];
                      newSyms[idx].notes = e.target.value;
                      setProfile({ ...profile, symptoms: newSyms });
                    }}
                  />
                </div>
                <div className="md:col-span-1 flex justify-center mt-6">
                  <button onClick={() => removeSymptom(sym.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INTERVENTIONS TAB */}
        {activeTab === 'interventions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">Supplements & Medications</h3>
              <button onClick={addIntervention} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                <Plus size={16} /> Add Item
              </button>
            </div>
            {profile.interventions.length === 0 && <p className="text-slate-400 italic text-center py-8">No interventions added.</p>}
            {profile.interventions.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-500 block mb-1">Category</label>
                  <select
                    value={item.category}
                    onChange={(e) => {
                      const list = [...profile.interventions];
                      list[idx].category = e.target.value as any;
                      setProfile({ ...profile, interventions: list });
                    }}
                    className="w-full p-2 rounded border border-slate-300 text-sm"
                  >
                    <option value="supplement">Supplement</option>
                    <option value="medication">Medication</option>
                    <option value="diet">Diet</option>
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="text-xs text-slate-500 block mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Magnesium Glycinate"
                    value={item.name}
                    onChange={(e) => {
                      const list = [...profile.interventions];
                      list[idx].name = e.target.value;
                      setProfile({ ...profile, interventions: list });
                    }}
                    className="w-full p-2 rounded border border-slate-300 text-sm"
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="text-xs text-slate-500 block mb-1">Dose / Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. 400mg nightly"
                    value={item.frequency || ''}
                    onChange={(e) => {
                      const list = [...profile.interventions];
                      list[idx].frequency = e.target.value;
                      setProfile({ ...profile, interventions: list });
                    }}
                    className="w-full p-2 rounded border border-slate-300 text-sm"
                  />
                </div>
                <div className="md:col-span-1 flex justify-center pb-2">
                  <button onClick={() => removeIntervention(item.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GOALS TAB */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">Health Goals</h3>
              <button onClick={addGoal} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                <Plus size={16} /> Add Goal
              </button>
            </div>
            {profile.goals.map((goal, idx) => (
              <div key={goal.id} className="flex gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100 items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="e.g. Improve deep sleep to 90 min"
                    value={goal.description}
                    onChange={(e) => {
                      const list = [...profile.goals];
                      list[idx].description = e.target.value;
                      setProfile({ ...profile, goals: list });
                    }}
                    className="w-full p-2 rounded border border-slate-300 text-sm"
                  />
                </div>
                <div className="w-32">
                  <select
                    value={goal.priority}
                    onChange={(e) => {
                      const list = [...profile.goals];
                      list[idx].priority = e.target.value as any;
                      setProfile({ ...profile, goals: list });
                    }}
                    className="w-full p-2 rounded border border-slate-300 text-sm"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <button onClick={() => removeGoal(goal.id)} className="text-slate-400 hover:text-red-500 px-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* BIOMETRICS TAB */}
        {activeTab === 'biometrics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age & Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <input
                type="number"
                value={profile.biometrics.age || ''}
                onChange={(e) => updateBiometric('age', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Biological Sex</label>
              <select
                value={profile.biometrics.gender || ''}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  biometrics: { ...prev.biometrics, gender: e.target.value }
                }))}
                className="w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Height (Split Ft/In) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Height</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Ft"
                    value={profile.biometrics.height_in ? Math.floor(profile.biometrics.height_in / 12) : ''}
                    onChange={(e) => {
                      const ft = parseInt(e.target.value) || 0;
                      const inch = (profile.biometrics.height_in || 0) % 12;
                      updateBiometric('height_in', (ft * 12 + inch).toString());
                    }}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                  <span className="text-xs text-slate-500">Feet</span>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="In"
                    max="11"
                    value={profile.biometrics.height_in ? Math.round(profile.biometrics.height_in % 12) : ''}
                    onChange={(e) => {
                      const inch = parseInt(e.target.value) || 0;
                      const ft = Math.floor((profile.biometrics.height_in || 0) / 12);
                      updateBiometric('height_in', (ft * 12 + inch).toString());
                    }}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                  <span className="text-xs text-slate-500">Inches</span>
                </div>
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Weight (lbs)</label>
              <input
                type="number"
                value={profile.biometrics.weight_lbs || ''}
                onChange={(e) => updateBiometric('weight_lbs', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md"
              />
            </div>

            {/* Body Fat & BMI */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Body Fat %</label>
              <input
                type="number"
                value={profile.biometrics.body_fat || ''}
                onChange={(e) => updateBiometric('body_fat', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              {/* BMI is computed, maybe just read only? Or let them edit if they want */}
              <label className="block text-sm font-medium text-slate-700 mb-1">BMI (Auto-calc)</label>
              <input
                type="number"
                disabled
                value={profile.biometrics.weight_lbs && profile.biometrics.height_in ? ((profile.biometrics.weight_lbs / (profile.biometrics.height_in * profile.biometrics.height_in)) * 703).toFixed(1) : ''}
                className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 text-slate-500"
              />
            </div>

            {/* Vitals */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Systolic BP</label>
              <input
                type="number"
                value={profile.biometrics.blood_pressure_systolic || ''} // Note: matched types.ts field name
                onChange={(e) => updateBiometric('blood_pressure_systolic', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Diastolic BP</label>
              <input
                type="number"
                value={profile.biometrics.blood_pressure_diastolic || ''} // Note: matched types.ts field name
                onChange={(e) => updateBiometric('blood_pressure_diastolic', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md"
              />
            </div>
          </div>
        )}

        {/* LABS TAB */}
        {activeTab === 'labs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">Lab Results</h3>
              <button onClick={addLab} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                <Plus size={16} /> Add Lab Value
              </button>
            </div>
            {profile.labs.map((lab, idx) => (
              <div key={lab.id} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100 items-end">
                <div className="col-span-4">
                  <label className="text-xs text-slate-500 block mb-1">Test Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ferritin"
                    value={lab.test_name}
                    onChange={(e) => {
                      const list = [...profile.labs];
                      list[idx].test_name = e.target.value;
                      setProfile({ ...profile, labs: list });
                    }}
                    className="w-full p-2 rounded border border-slate-300 text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-xs text-slate-500 block mb-1">Value</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={lab.value || ''}
                    onChange={(e) => {
                      const list = [...profile.labs];
                      list[idx].value = parseFloat(e.target.value);
                      setProfile({ ...profile, labs: list });
                    }}
                    className="w-full p-2 rounded border border-slate-300 text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-xs text-slate-500 block mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="ng/mL"
                    value={lab.unit}
                    onChange={(e) => {
                      const list = [...profile.labs];
                      list[idx].unit = e.target.value;
                      setProfile({ ...profile, labs: list });
                    }}
                    className="w-full p-2 rounded border border-slate-300 text-sm"
                  />
                </div>
                <div className="col-span-2 flex justify-center pb-2">
                  <button onClick={() => removeLab(lab.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
