import type { HealthIntake } from '../intakeTypes';
import type { Goal, Intervention, Symptom, UserProfile } from '../types';

function intensityToPriority(intensity: number): Goal['priority'] {
  if (intensity >= 7) return 'high';
  if (intensity >= 4) return 'medium';
  return 'low';
}

export function mergeIntakeIntoStructuredProfile(
  profile: UserProfile,
  intake: HealthIntake,
  options?: { appendLists?: boolean }
): UserProfile {
  const appendLists = options?.appendLists !== false;
  const biometrics = { ...profile.biometrics };

  const h = intake.baseline.heightIn.trim();
  const w = intake.baseline.weightLbs.trim();
  const rhr = intake.baseline.rhr.trim();
  const sys = intake.baseline.bpSys.trim();
  const dia = intake.baseline.bpDia.trim();

  if (h) biometrics.height_in = parseFloat(h);
  if (w) biometrics.weight_lbs = parseFloat(w);
  if (rhr) biometrics.resting_heart_rate = parseFloat(rhr);
  if (sys) biometrics.blood_pressure_systolic = parseFloat(sys);
  if (dia) biometrics.blood_pressure_diastolic = parseFloat(dia);

  if (intake.context.birthYear.trim()) {
    const y = parseInt(intake.context.birthYear, 10);
    if (!Number.isNaN(y)) {
      const age = new Date().getFullYear() - y;
      if (age > 0 && age < 120) biometrics.age = age;
    }
  }
  if (intake.context.gender.trim()) {
    biometrics.gender = intake.context.gender;
  }

  const goals: Goal[] = appendLists ? [...profile.goals] : profile.goals;
  if (appendLists) {
    intake.domains.forEach((d) => {
      if (!d.label.trim()) return;
      goals.push({
        id: '',
        description: `${d.label} — ${d.kind} (${d.intensity}/10)`,
        priority: intensityToPriority(d.intensity),
        status: 'active',
      });
    });
  }

  const symptoms: Symptom[] = appendLists ? [...profile.symptoms] : profile.symptoms;
  if (appendLists) {
    intake.strains.items.forEach((s) => {
      if (!s.area.trim()) return;
      symptoms.push({
        id: '',
        name: s.area,
        severity: 3,
        notes: `Load: ${s.severityOrFrequency}. Management effort: ${s.effortToManage}`,
      });
    });
  }

  const interventions: Intervention[] = appendLists ? [...profile.interventions] : profile.interventions;
  if (appendLists) {
    if (intake.strains.allergies.trim()) {
      interventions.push({
        id: '',
        category: 'lifestyle',
        name: 'Allergies / sensitivities (self-reported)',
        frequency: intake.strains.allergies.slice(0, 500),
      });
    }
    if (intake.strains.contraindications.trim()) {
      interventions.push({
        id: '',
        category: 'lifestyle',
        name: 'Guardrails / contraindications (self-reported)',
        frequency: intake.strains.contraindications.slice(0, 500),
      });
    }

    intake.programs.forEach((p) => {
      if (!p.name.trim()) return;
      const act = p.activities
        .filter((a) => a.label.trim())
        .map((a) => {
          const bits = [a.label];
          if (a.targetFrequency.trim()) bits.push(a.targetFrequency.trim());
          if (a.lastDone.trim()) bits.push(`last: ${a.lastDone.trim()}`);
          return bits.join(' — ');
        })
        .join(' | ');
      interventions.push({
        id: '',
        category: 'lifestyle',
        name: `Program: ${p.name}${p.type ? ` (${p.type})` : ''}`,
        frequency: act.slice(0, 500) || '—',
      });
    });

    intake.weeklyHabits.forEach((hab) => {
      if (!hab.category.trim()) return;
      interventions.push({
        id: '',
        category: 'lifestyle',
        name: `Weekly rhythm: ${hab.category}`,
        frequency: `${hab.hoursPerWeek} h / week (self-reported)`,
      });
    });
  }

  return {
    ...profile,
    biometrics,
    goals,
    symptoms,
    interventions,
    lifestyle_intake: { ...intake, completedAt: new Date().toISOString() },
    onboarding_complete: true,
  };
}
