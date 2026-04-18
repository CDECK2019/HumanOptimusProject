export interface FocusDomain {
  id: string;
  label: string;
  kind: 'priority' | 'concern' | 'maintenance';
  intensity: number;
}

export interface WeeklyHabit {
  id: string;
  category: string;
  hoursPerWeek: number;
}

export interface StrainItem {
  id: string;
  area: string;
  severityOrFrequency: string;
  effortToManage: string;
}

export interface ProgramActivity {
  id: string;
  label: string;
  targetFrequency: string;
  lastDone: string;
}

export interface HealthProgram {
  id: string;
  name: string;
  type: string;
  activities: ProgramActivity[];
}

export interface HealthIntake {
  context: {
    ageRange: string;
    birthYear: string;
    gender: string;
    zip: string;
    household: string;
  };
  environment: {
    living: string;
    workPattern: string;
    commute: string;
    sleepEnv: string;
    foodAccess: string;
  };
  careAccess: {
    coverage: string;
    lastPcp: string;
    barriers: string[];
  };
  investments: {
    timeMovement: string;
    timeSleep: string;
    timeMeals: string;
    spendNote: string;
  };
  domains: FocusDomain[];
  weeklyHabits: WeeklyHabit[];
  baseline: {
    heightIn: string;
    weightLbs: string;
    waistIn: string;
    rhr: string;
    bpSys: string;
    bpDia: string;
    customRows: { id: string; name: string; value: string }[];
  };
  strains: {
    items: StrainItem[];
    allergies: string;
    contraindications: string;
  };
  programs: HealthProgram[];
  completedAt?: string;
}

export const emptyHealthIntake = (): HealthIntake => ({
  context: { ageRange: '', birthYear: '', gender: '', zip: '', household: '' },
  environment: { living: '', workPattern: '', commute: '', sleepEnv: '', foodAccess: '' },
  careAccess: { coverage: '', lastPcp: '', barriers: [] },
  investments: { timeMovement: '', timeSleep: '', timeMeals: '', spendNote: '' },
  domains: [],
  weeklyHabits: [],
  baseline: { heightIn: '', weightLbs: '', waistIn: '', rhr: '', bpSys: '', bpDia: '', customRows: [] },
  strains: { items: [], allergies: '', contraindications: '' },
  programs: [],
});
