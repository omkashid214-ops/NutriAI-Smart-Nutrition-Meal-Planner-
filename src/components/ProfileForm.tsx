import React, { useMemo, useState } from 'react';
import { Check, Save } from 'lucide-react';
import {
  ActivityLevel,
  DietaryPreference,
  FitnessGoal,
  Gender,
  UserProfile,
} from '../types/nutrition';
import {
  ACTIVITY_MULTIPLIERS,
  DIET_LABELS,
  GOAL_LABELS,
  calculateBMI,
  calculateCaloriePlan,
} from '../services/nutritionEngine';

interface ProfileFormProps {
  initialProfile: UserProfile;
  submitLabel?: string;
  onSave: (updated: UserProfile) => Promise<void> | void;
  saving?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialProfile,
  submitLabel = 'Save Profile',
  onSave,
  saving = false,
}) => {
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [age, setAge] = useState(String(initialProfile.age));
  const [gender, setGender] = useState<Gender>(initialProfile.gender);
  const [heightCm, setHeightCm] = useState(String(initialProfile.heightCm));
  const [weightKg, setWeightKg] = useState(String(initialProfile.weightKg));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initialProfile.activityLevel);
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(
    initialProfile.dietaryPreference
  );
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(initialProfile.fitnessGoal);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const liveMetrics = useMemo(() => {
    const numAge = Math.max(10, Math.min(120, Number(age) || 22));
    const numHeight = Math.max(80, Math.min(260, Number(heightCm) || 170));
    const numWeight = Math.max(20, Math.min(300, Number(weightKg) || 68));
    const bmiRes = calculateBMI(numHeight, numWeight);
    const calPlan = calculateCaloriePlan({
      age: numAge,
      gender,
      heightCm: numHeight,
      weightKg: numWeight,
      activityLevel,
      fitnessGoal,
    });
    return { bmiRes, calPlan };
  }, [age, gender, heightCm, weightKg, activityLevel, fitnessGoal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedNotice(false);

    const parsedAge = Number(age);
    const parsedHeight = Number(heightCm);
    const parsedWeight = Number(weightKg);

    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (!Number.isFinite(parsedAge) || parsedAge < 10 || parsedAge > 120) {
      setError('Please enter a valid age between 10 and 120.');
      return;
    }
    if (!Number.isFinite(parsedHeight) || parsedHeight < 80 || parsedHeight > 260) {
      setError('Please enter a valid height between 80 cm and 260 cm.');
      return;
    }
    if (!Number.isFinite(parsedWeight) || parsedWeight < 20 || parsedWeight > 300) {
      setError('Please enter a valid weight between 20 kg and 300 kg.');
      return;
    }

    const updated: UserProfile = {
      ...initialProfile,
      fullName: fullName.trim().slice(0, 80),
      age: Math.round(parsedAge),
      gender,
      heightCm: Math.round(parsedHeight * 10) / 10,
      weightKg: Math.round(parsedWeight * 10) / 10,
      activityLevel,
      dietaryPreference,
      fitnessGoal,
      bmi: liveMetrics.bmiRes.bmi,
      bmiCategory: liveMetrics.bmiRes.category,
      dailyCalorieTarget: liveMetrics.calPlan.targetCalories,
    };

    await onSave(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2400);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs"
        >
          {error}
        </div>
      )}

      {/* Live Preview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#F2F7F2] border border-[#D8E7DA]">
        <div>
          <span className="text-xs text-[#526458] block">Estimated BMI</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-mono text-xl font-semibold tabular-nums text-[#14231A]">
              {liveMetrics.bmiRes.bmi.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-[#1B6B40]">
              {liveMetrics.bmiRes.category}
            </span>
          </div>
        </div>
        <div>
          <span className="text-xs text-[#526458] block">Daily Calorie Target</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-mono text-xl font-semibold tabular-nums text-[#14231A]">
              {liveMetrics.calPlan.targetCalories}
            </span>
            <span className="text-xs text-[#526458]">kcal / day</span>
          </div>
        </div>
        <div>
          <span className="text-xs text-[#526458] block">Daily Macro Split</span>
          <div className="font-mono text-xs tabular-nums text-[#14231A] mt-1.5">
            P {liveMetrics.calPlan.proteinTargetG}g · C {liveMetrics.calPlan.carbsTargetG}g · F{' '}
            {liveMetrics.calPlan.fatTargetG}g
          </div>
        </div>
      </div>

      {/* Identity & Biometrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="pf-name" className="block text-xs font-medium text-[#374B3E] mb-1.5">
            Full Name
          </label>
          <input
            id="pf-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={80}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8E1D5] bg-[#FAFBF9] text-sm text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#1B6B40]/30 focus:border-[#1B6B40]"
          />
        </div>

        <div>
          <label htmlFor="pf-age" className="block text-xs font-medium text-[#374B3E] mb-1.5">
            Age (years)
          </label>
          <input
            id="pf-age"
            type="number"
            min={10}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8E1D5] bg-[#FAFBF9] text-sm font-mono tabular-nums text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#1B6B40]/30 focus:border-[#1B6B40]"
          />
        </div>

        <div>
          <span className="block text-xs font-medium text-[#374B3E] mb-1.5">Gender</span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#F1F5EE] rounded-xl">
            {(['male', 'female', 'other'] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`min-h-[38px] rounded-lg text-xs font-medium capitalize transition-colors ${
                  gender === g
                    ? 'bg-white text-[#14231A] shadow-xs'
                    : 'text-[#526458] hover:text-[#14231A]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="pf-height" className="block text-xs font-medium text-[#374B3E] mb-1.5">
            Height (cm)
          </label>
          <input
            id="pf-height"
            type="number"
            min={80}
            max={260}
            step="0.5"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8E1D5] bg-[#FAFBF9] text-sm font-mono tabular-nums text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#1B6B40]/30 focus:border-[#1B6B40]"
          />
        </div>

        <div>
          <label htmlFor="pf-weight" className="block text-xs font-medium text-[#374B3E] mb-1.5">
            Weight (kg)
          </label>
          <input
            id="pf-weight"
            type="number"
            min={20}
            max={300}
            step="0.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8E1D5] bg-[#FAFBF9] text-sm font-mono tabular-nums text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#1B6B40]/30 focus:border-[#1B6B40]"
          />
        </div>
      </div>

      {/* Dietary Preference */}
      <div>
        <span className="block text-xs font-medium text-[#374B3E] mb-2">Dietary Preference</span>
        <div className="grid grid-cols-3 gap-2">
          {(['vegetarian', 'vegan', 'non_vegetarian'] as DietaryPreference[]).map((diet) => (
            <button
              key={diet}
              type="button"
              onClick={() => setDietaryPreference(diet)}
              className={`min-h-[44px] px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                dietaryPreference === diet
                  ? 'bg-[#1B6B40] border-[#1B6B40] text-white'
                  : 'bg-white border-[#D8E1D5] text-[#374B3E] hover:border-[#1B6B40]/50'
              }`}
            >
              {DIET_LABELS[diet]}
            </button>
          ))}
        </div>
      </div>

      {/* Fitness Goal */}
      <div>
        <span className="block text-xs font-medium text-[#374B3E] mb-2">Fitness Goal</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(['weight_loss', 'weight_maintenance', 'weight_gain'] as FitnessGoal[]).map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => setFitnessGoal(goal)}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left transition-colors ${
                fitnessGoal === goal
                  ? 'bg-[#E6F4EC] border-[#1B6B40] text-[#14532D]'
                  : 'bg-white border-[#D8E1D5] text-[#374B3E] hover:border-[#1B6B40]/40'
              }`}
            >
              <div className="text-sm font-semibold">{GOAL_LABELS[goal].label}</div>
              <div className="text-xs opacity-80 mt-0.5">
                {GOAL_LABELS[goal].delta === 0
                  ? 'Balanced TDEE'
                  : `${GOAL_LABELS[goal].delta > 0 ? '+' : ''}${GOAL_LABELS[goal].delta} kcal/day`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Activity Level */}
      <div>
        <label htmlFor="pf-activity" className="block text-xs font-medium text-[#374B3E] mb-1.5">
          Daily Activity Level
        </label>
        <select
          id="pf-activity"
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D8E1D5] bg-[#FAFBF9] text-sm text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#1B6B40]/30 focus:border-[#1B6B40]"
        >
          {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => (
            <option key={level} value={level}>
              {ACTIVITY_MULTIPLIERS[level].label} — {ACTIVITY_MULTIPLIERS[level].description}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 rounded-xl bg-[#1B6B40] text-white text-sm font-medium hover:bg-[#14532D] transition-colors disabled:opacity-60"
        >
          {savedNotice ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : savedNotice ? 'Profile Saved' : submitLabel}</span>
        </button>
      </div>
    </form>
  );
};
