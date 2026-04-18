import React, { useEffect, useId, useRef, useState } from 'react';
import { UserProfile, Symptom, Intervention, Goal, Lab, Biometrics } from '../types';
import { Plus, Trash2, Activity, Pill, Target, TestTube, Scale } from 'lucide-react';

interface ProfileFormProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

type TabId = 'symptoms' | 'interventions' | 'goals' | 'biometrics' | 'labs';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'symptoms', label: 'Symptoms', icon: Activity },
  { id: 'interventions', label: 'Interventions', icon: Pill },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'biometrics', label: 'Biometrics', icon: Scale },
  { id: 'labs', label: 'Labs', icon: TestTube },
];

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20';

const fieldLabel = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500';

const addRowButton =
  'flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100';

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, setProfile }) => {
  const [activeTab, setActiveTab] = useState<TabId>('symptoms');
  const tabsId = useId();

  const updateBiometric = (field: keyof Biometrics, value: string) => {
    setProfile((prev) => ({
      ...prev,
      biometrics: { ...prev.biometrics, [field]: value === '' ? undefined : parseFloat(value) },
    }));
  };

  const addSymptom = () =>
    setProfile((prev) => ({
      ...prev,
      symptoms: [
        ...prev.symptoms,
        { id: Date.now().toString(), name: '', severity: 3, duration_days: 0, notes: '' },
      ],
    }));
  const removeSymptom = (id: string) =>
    setProfile((prev) => ({ ...prev, symptoms: prev.symptoms.filter((s) => s.id !== id) }));

  const addIntervention = () =>
    setProfile((prev) => ({
      ...prev,
      interventions: [
        ...prev.interventions,
        { id: Date.now().toString(), category: 'supplement', name: '' },
      ],
    }));
  const removeIntervention = (id: string) =>
    setProfile((prev) => ({ ...prev, interventions: prev.interventions.filter((i) => i.id !== id) }));

  const addGoal = () =>
    setProfile((prev) => ({
      ...prev,
      goals: [
        ...prev.goals,
        { id: Date.now().toString(), description: '', priority: 'medium', status: 'active' },
      ],
    }));
  const removeGoal = (id: string) =>
    setProfile((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));

  const addLab = () =>
    setProfile((prev) => ({
      ...prev,
      labs: [...prev.labs, { id: Date.now().toString(), test_name: '', value: 0, unit: '' }],
    }));
  const removeLab = (id: string) =>
    setProfile((prev) => ({ ...prev, labs: prev.labs.filter((l) => l.id !== id) }));

  const tabRefs = useRef<Map<TabId, HTMLButtonElement | null>>(new Map());

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, tab: TabId) => {
    const ids = TABS.map((t) => t.id);
    const idx = ids.indexOf(tab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = e.key === 'ArrowRight' ? (idx + 1) % ids.length : (idx - 1 + ids.length) % ids.length;
      const target = tabRefs.current.get(ids[next]);
      target?.focus();
      setActiveTab(ids[next]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab(ids[0]);
      tabRefs.current.get(ids[0])?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveTab(ids[ids.length - 1]);
      tabRefs.current.get(ids[ids.length - 1])?.focus();
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white ring-1 ring-slate-900/5">
      {/* Mobile select */}
      <div className="border-b border-slate-200 bg-slate-50 p-4 md:hidden">
        <label htmlFor={`${tabsId}-select`} className="sr-only">
          Profile section
        </label>
        <select
          id={`${tabsId}-select`}
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as TabId)}
          className="w-full rounded-lg border border-slate-300 p-3 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {TABS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop tabs (ARIA-compliant) */}
      <div role="tablist" aria-label="Profile sections" className="hidden border-b border-slate-200 bg-slate-50/50 md:flex">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current.set(tab.id, el);
              }}
              role="tab"
              type="button"
              id={`${tabsId}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${tabsId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-2 overflow-hidden py-5 text-sm font-semibold transition-all ${
                isActive ? 'bg-white text-emerald-700' : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-800'
              }`}
            >
              {isActive && <div className="absolute left-0 top-0 h-[3px] w-full bg-emerald-500" />}
              <Icon className={`h-4 w-4 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-[400px] bg-white p-8">
        {/* SYMPTOMS */}
        {activeTab === 'symptoms' && (
          <section
            role="tabpanel"
            id={`${tabsId}-panel-symptoms`}
            aria-labelledby={`${tabsId}-tab-symptoms`}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">What are you feeling?</h3>
                <p className="text-sm text-slate-500">Track physical and mental sensations.</p>
              </div>
              <button type="button" onClick={addSymptom} className={addRowButton}>
                <Plus className="h-4 w-4" /> Add symptom
              </button>
            </div>

            {profile.symptoms.length === 0 && (
              <EmptyRow icon={Activity} label="No symptoms tracked yet." />
            )}

            <div className="grid gap-4">
              {profile.symptoms.map((sym, idx) => (
                <SymptomRow
                  key={sym.id}
                  index={idx}
                  symptom={sym}
                  onChange={(patch) => {
                    setProfile((prev) => {
                      const list = [...prev.symptoms];
                      list[idx] = { ...list[idx], ...patch };
                      return { ...prev, symptoms: list };
                    });
                  }}
                  onRemove={() => removeSymptom(sym.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* INTERVENTIONS */}
        {activeTab === 'interventions' && (
          <section
            role="tabpanel"
            id={`${tabsId}-panel-interventions`}
            aria-labelledby={`${tabsId}-tab-interventions`}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">Supplements &amp; meds</h3>
                <p className="text-sm text-slate-500">Log your current protocol.</p>
              </div>
              <button type="button" onClick={addIntervention} className={addRowButton}>
                <Plus className="h-4 w-4" /> Add item
              </button>
            </div>

            {profile.interventions.length === 0 && (
              <EmptyRow icon={Pill} label="No interventions added." />
            )}

            <div className="grid gap-4">
              {profile.interventions.map((item, idx) => (
                <InterventionRow
                  key={item.id}
                  index={idx}
                  item={item}
                  onChange={(patch) => {
                    setProfile((prev) => {
                      const list = [...prev.interventions];
                      list[idx] = { ...list[idx], ...patch };
                      return { ...prev, interventions: list };
                    });
                  }}
                  onRemove={() => removeIntervention(item.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* GOALS */}
        {activeTab === 'goals' && (
          <section
            role="tabpanel"
            id={`${tabsId}-panel-goals`}
            aria-labelledby={`${tabsId}-tab-goals`}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">Health goals</h3>
                <p className="text-sm text-slate-500">What are your top priorities?</p>
              </div>
              <button type="button" onClick={addGoal} className={addRowButton}>
                <Plus className="h-4 w-4" /> Add goal
              </button>
            </div>

            {profile.goals.length === 0 && <EmptyRow icon={Target} label="No goals set." />}

            <div className="grid gap-3">
              {profile.goals.map((goal, idx) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  index={idx}
                  onChange={(patch) => {
                    setProfile((prev) => {
                      const list = [...prev.goals];
                      list[idx] = { ...list[idx], ...patch };
                      return { ...prev, goals: list };
                    });
                  }}
                  onRemove={() => removeGoal(goal.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* BIOMETRICS */}
        {activeTab === 'biometrics' && (
          <section
            role="tabpanel"
            id={`${tabsId}-panel-biometrics`}
            aria-labelledby={`${tabsId}-tab-biometrics`}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900">Biometrics</h3>
              <p className="text-sm text-slate-500">Your core vital stats.</p>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <div>
                <label htmlFor="bio-age" className={fieldLabel}>Age</label>
                <input
                  id="bio-age"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={profile.biometrics.age ?? ''}
                  onChange={(e) => updateBiometric('age', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="bio-gender" className={fieldLabel}>Sex / gender</label>
                <select
                  id="bio-gender"
                  value={profile.biometrics.gender ?? ''}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      biometrics: { ...prev.biometrics, gender: e.target.value || undefined },
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Intersex">Intersex</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <HeightInput biometrics={profile.biometrics} setProfile={setProfile} />

              <div>
                <label htmlFor="bio-weight" className={fieldLabel}>Weight (lbs)</label>
                <input
                  id="bio-weight"
                  type="number"
                  min={0}
                  step="0.1"
                  inputMode="decimal"
                  value={profile.biometrics.weight_lbs ?? ''}
                  onChange={(e) => updateBiometric('weight_lbs', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="bio-bf" className={fieldLabel}>Body fat %</label>
                <input
                  id="bio-bf"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={profile.biometrics.body_fat ?? ''}
                  onChange={(e) => updateBiometric('body_fat', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="bio-bmi" className={fieldLabel}>BMI (auto)</label>
                <input
                  id="bio-bmi"
                  type="text"
                  disabled
                  value={
                    profile.biometrics.weight_lbs && profile.biometrics.height_in
                      ? (
                          (profile.biometrics.weight_lbs /
                            (profile.biometrics.height_in * profile.biometrics.height_in)) *
                          703
                        ).toFixed(1)
                      : ''
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 p-2.5 font-mono text-sm text-slate-500"
                />
              </div>

              <div>
                <label htmlFor="bio-sys" className={fieldLabel}>Systolic BP</label>
                <input
                  id="bio-sys"
                  type="number"
                  min={0}
                  value={profile.biometrics.blood_pressure_systolic ?? ''}
                  onChange={(e) => updateBiometric('blood_pressure_systolic', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="bio-dia" className={fieldLabel}>Diastolic BP</label>
                <input
                  id="bio-dia"
                  type="number"
                  min={0}
                  value={profile.biometrics.blood_pressure_diastolic ?? ''}
                  onChange={(e) => updateBiometric('blood_pressure_diastolic', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="bio-rhr" className={fieldLabel}>Resting heart rate</label>
                <input
                  id="bio-rhr"
                  type="number"
                  min={0}
                  value={profile.biometrics.resting_heart_rate ?? ''}
                  onChange={(e) => updateBiometric('resting_heart_rate', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </section>
        )}

        {/* LABS */}
        {activeTab === 'labs' && (
          <section
            role="tabpanel"
            id={`${tabsId}-panel-labs`}
            aria-labelledby={`${tabsId}-tab-labs`}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">Lab results</h3>
                <p className="text-sm text-slate-500">Upload key biomarkers.</p>
              </div>
              <button type="button" onClick={addLab} className={addRowButton}>
                <Plus className="h-4 w-4" /> Add lab value
              </button>
            </div>

            {profile.labs.length === 0 && <EmptyRow icon={TestTube} label="No lab data yet." />}

            <div className="grid gap-3">
              {profile.labs.map((lab, idx) => (
                <LabRow
                  key={lab.id}
                  lab={lab}
                  index={idx}
                  onChange={(patch) => {
                    setProfile((prev) => {
                      const list = [...prev.labs];
                      list[idx] = { ...list[idx], ...patch };
                      return { ...prev, labs: list };
                    });
                  }}
                  onRemove={() => removeLab(lab.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const EmptyRow: React.FC<{ icon: React.ElementType; label: string }> = ({ icon: Icon, label }) => (
  <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
    <Icon className="mx-auto mb-2 h-8 w-8 text-slate-300" />
    <p className="font-medium text-slate-500">{label}</p>
  </div>
);

interface SymptomRowProps {
  symptom: Symptom;
  index: number;
  onChange: (patch: Partial<Symptom>) => void;
  onRemove: () => void;
}

const SymptomRow: React.FC<SymptomRowProps> = ({ symptom, index, onChange, onRemove }) => (
  <div className="group grid grid-cols-1 items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md md:grid-cols-12">
    <div className="md:col-span-4">
      <label htmlFor={`sym-name-${index}`} className={fieldLabel}>Symptom name</label>
      <input
        id={`sym-name-${index}`}
        type="text"
        autoComplete="off"
        placeholder="e.g. Brain fog"
        value={symptom.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className={inputClass}
      />
    </div>
    <div className="md:col-span-3">
      <label htmlFor={`sym-sev-${index}`} className={fieldLabel}>
        Severity <span className="font-mono text-emerald-700">{symptom.severity}/5</span>
      </label>
      <input
        id={`sym-sev-${index}`}
        type="range"
        min={1}
        max={5}
        step={1}
        value={symptom.severity}
        onChange={(e) => onChange({ severity: parseInt(e.target.value, 10) })}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-600"
      />
    </div>
    <div className="md:col-span-4">
      <label htmlFor={`sym-notes-${index}`} className={fieldLabel}>Notes / duration</label>
      <input
        id={`sym-notes-${index}`}
        type="text"
        autoComplete="off"
        placeholder="Worse in mornings, 3 weeks"
        value={symptom.notes ?? ''}
        onChange={(e) => onChange({ notes: e.target.value })}
        className={inputClass}
      />
    </div>
    <div className="flex justify-center pt-7 md:col-span-1">
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove symptom"
        className="rounded-lg p-2 text-slate-400 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 className="h-[18px] w-[18px]" />
      </button>
    </div>
  </div>
);

interface InterventionRowProps {
  item: Intervention;
  index: number;
  onChange: (patch: Partial<Intervention>) => void;
  onRemove: () => void;
}

const InterventionRow: React.FC<InterventionRowProps> = ({ item, index, onChange, onRemove }) => (
  <div className="group grid grid-cols-1 items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md md:grid-cols-12">
    <div className="md:col-span-2">
      <label htmlFor={`iv-cat-${index}`} className={fieldLabel}>Category</label>
      <select
        id={`iv-cat-${index}`}
        value={item.category}
        onChange={(e) => onChange({ category: e.target.value as Intervention['category'] })}
        className={inputClass}
      >
        <option value="supplement">Supplement</option>
        <option value="medication">Medication</option>
        <option value="diet">Diet</option>
        <option value="lifestyle">Lifestyle / program</option>
      </select>
    </div>
    <div className="md:col-span-4">
      <label htmlFor={`iv-name-${index}`} className={fieldLabel}>Name</label>
      <input
        id={`iv-name-${index}`}
        type="text"
        autoComplete="off"
        placeholder="e.g. Magnesium glycinate"
        value={item.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className={inputClass}
      />
    </div>
    <div className="md:col-span-5">
      <label htmlFor={`iv-freq-${index}`} className={fieldLabel}>Dose / frequency</label>
      <input
        id={`iv-freq-${index}`}
        type="text"
        autoComplete="off"
        placeholder="e.g. 400 mg nightly"
        value={item.frequency ?? ''}
        onChange={(e) => onChange({ frequency: e.target.value })}
        className={inputClass}
      />
    </div>
    <div className="flex justify-center pb-2 md:col-span-1">
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove intervention"
        className="rounded-lg p-2 text-slate-400 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 className="h-[18px] w-[18px]" />
      </button>
    </div>
  </div>
);

interface GoalRowProps {
  goal: Goal;
  index: number;
  onChange: (patch: Partial<Goal>) => void;
  onRemove: () => void;
}

const GoalRow: React.FC<GoalRowProps> = ({ goal, index, onChange, onRemove }) => (
  <div className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
    <div className="flex-1">
      <label htmlFor={`goal-${index}`} className="sr-only">Goal description</label>
      <input
        id={`goal-${index}`}
        type="text"
        autoComplete="off"
        placeholder="e.g. Improve deep sleep to 90 min"
        value={goal.description}
        onChange={(e) => onChange({ description: e.target.value })}
        className={inputClass}
      />
    </div>
    <div className="w-40">
      <label htmlFor={`goal-pri-${index}`} className="sr-only">Priority</label>
      <select
        id={`goal-pri-${index}`}
        value={goal.priority}
        onChange={(e) => onChange({ priority: e.target.value as Goal['priority'] })}
        className={inputClass}
      >
        <option value="high">High priority</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
    <button
      type="button"
      onClick={onRemove}
      aria-label="Remove goal"
      className="rounded-lg p-2 text-slate-400 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 focus:opacity-100"
    >
      <Trash2 className="h-[18px] w-[18px]" />
    </button>
  </div>
);

interface LabRowProps {
  lab: Lab;
  index: number;
  onChange: (patch: Partial<Lab>) => void;
  onRemove: () => void;
}

const LabRow: React.FC<LabRowProps> = ({ lab, index, onChange, onRemove }) => (
  <div className="group grid grid-cols-12 items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
    <div className="col-span-4">
      <label htmlFor={`lab-name-${index}`} className={fieldLabel}>Test name</label>
      <input
        id={`lab-name-${index}`}
        type="text"
        autoComplete="off"
        placeholder="e.g. Ferritin"
        value={lab.test_name}
        onChange={(e) => onChange({ test_name: e.target.value })}
        className={inputClass}
      />
    </div>
    <div className="col-span-3">
      <label htmlFor={`lab-val-${index}`} className={fieldLabel}>Value</label>
      <input
        id={`lab-val-${index}`}
        type="number"
        step="any"
        autoComplete="off"
        placeholder="30"
        value={Number.isFinite(lab.value) ? lab.value : ''}
        onChange={(e) => {
          const v = e.target.value;
          // Empty string → 0 (PocketBase number field can't be undefined). Better
          // than NaN. We choose 0 so users see when they cleared a row.
          onChange({ value: v === '' ? 0 : parseFloat(v) });
        }}
        className={inputClass}
      />
    </div>
    <div className="col-span-3">
      <label htmlFor={`lab-unit-${index}`} className={fieldLabel}>Unit</label>
      <input
        id={`lab-unit-${index}`}
        type="text"
        autoComplete="off"
        placeholder="ng/mL"
        value={lab.unit}
        onChange={(e) => onChange({ unit: e.target.value })}
        className={inputClass}
      />
    </div>
    <div className="col-span-2 flex justify-center pb-2">
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove lab"
        className="rounded-lg p-2 text-slate-400 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 className="h-[18px] w-[18px]" />
      </button>
    </div>
  </div>
);

interface HeightInputProps {
  biometrics: Biometrics;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

/**
 * Height ft/in are stored as a single `height_in` total. The two text inputs
 * keep their own local state to avoid the rounding-driven jitter we used to see
 * when the displayed value was derived from the persisted total on every
 * keystroke. We commit on blur and only sync local state from props when the
 * canonical value changes from outside (e.g. import).
 */
const HeightInput: React.FC<HeightInputProps> = ({ biometrics, setProfile }) => {
  const totalIn = biometrics.height_in ?? 0;
  const [ft, setFt] = useState(() => (totalIn ? String(Math.floor(totalIn / 12)) : ''));
  const [inches, setInches] = useState(() => (totalIn ? String(Math.round(totalIn % 12)) : ''));

  // Re-sync if the canonical value changes from outside this component.
  useEffect(() => {
    const canonical = (parseInt(ft || '0', 10) || 0) * 12 + (parseInt(inches || '0', 10) || 0);
    if (canonical !== totalIn) {
      setFt(totalIn ? String(Math.floor(totalIn / 12)) : '');
      setInches(totalIn ? String(Math.round(totalIn % 12)) : '');
    }
    // We intentionally only react to the canonical totalIn changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalIn]);

  const commit = () => {
    const ftNum = parseInt(ft || '0', 10) || 0;
    const inNum = Math.min(11, parseInt(inches || '0', 10) || 0);
    const total = ftNum * 12 + inNum;
    setProfile((prev) => ({
      ...prev,
      biometrics: { ...prev.biometrics, height_in: total > 0 ? total : undefined },
    }));
  };

  return (
    <div>
      <label className={fieldLabel}>Height</label>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <label htmlFor="bio-ft" className="sr-only">Feet</label>
          <input
            id="bio-ft"
            type="number"
            min={0}
            max={9}
            inputMode="numeric"
            placeholder="0"
            value={ft}
            onChange={(e) => setFt(e.target.value)}
            onBlur={commit}
            className={`${inputClass} pr-9`}
          />
          <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">ft</span>
        </div>
        <div className="relative flex-1">
          <label htmlFor="bio-in" className="sr-only">Inches</label>
          <input
            id="bio-in"
            type="number"
            min={0}
            max={11}
            inputMode="numeric"
            placeholder="0"
            value={inches}
            onChange={(e) => setInches(e.target.value)}
            onBlur={commit}
            className={`${inputClass} pr-9`}
          />
          <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">in</span>
        </div>
      </div>
    </div>
  );
};
