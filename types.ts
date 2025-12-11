// MVP Schema & Types Alignment

export type Tier = 0 | 1 | 2 | 3 | 4;

export type GoalPriority = 'low' | 'medium' | 'high';
export type GoalStatus = 'active' | 'paused' | 'achieved';

// matches 'health_snapshots'
export interface HealthSnapshot {
  id: string; // UUID
  user_id: string; // UUID
  created_at: string; // TIMESTAMPTZ
  label?: string;
  is_active: boolean;
}

// matches 'symptoms'
export interface Symptom {
  id: string; // UUID
  snapshot_id?: string;
  name: string;
  severity: number; // 1-5
  duration_days?: number;
  notes?: string;
}

// matches 'interventions'
export interface Intervention {
  id: string; // UUID
  snapshot_id?: string;
  category: 'supplement' | 'medication' | 'diet' | 'lifestyle';
  name: string;
  dose_amount?: number; // FLOAT
  dose_unit?: string;
  frequency?: string;
  started_at?: string; // DATE
  stopped_at?: string; // DATE
}

// matches 'goals'
export interface Goal {
  id: string; // UUID
  snapshot_id?: string;
  description: string;
  priority: GoalPriority;
  status: GoalStatus;
}

// matches 'biometrics'
export interface Biometrics {
  snapshot_id?: string;
  age?: number;
  gender?: string;
  height_in?: number;
  weight_lbs?: number;
  body_fat?: number;
  bmi?: number; // computed
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  resting_heart_rate?: number;
}

// matches 'labs'
export interface Lab {
  id: string; // UUID
  snapshot_id?: string;
  test_name: string;
  value: number;
  unit: string;
  reference_range_low?: number;
  reference_range_high?: number;
  collection_date?: string; // DATE
}

// Application-level Profile wrapper
export interface UserProfile {
  // Metadata for the current snapshot being viewed/edited
  snapshot_id?: string;
  created_at?: string;
  tier?: Tier; // computed value based on filled data

  symptoms: Symptom[];
  interventions: Intervention[];
  goals: Goal[];
  biometrics: Biometrics;
  labs: Lab[];
}

// Council Response Types
export interface RecommendationSet {
  immediate_safe: string[];
  consider: string[];
  explore_with_testing: string[];
  avoid: string[];
}

export interface CouncilResponse {
  key_insights: string;
  recommendations: RecommendationSet;
  why_experts_differ: string;
  next_best_step: string;
  disclaimer: string;
}
