import React, { useMemo, useState } from 'react';
import { Check, Flame, Scale } from 'lucide-react';
import {
  ActivityLevel,
  FitnessGoal,
  Gender,
  UserProfile,
} from '../types/nutrition';
import {
  ACTIVITY_MULTIPLIERS,
  GOAL_LABELS,
  calculateBMI,
  calculateCaloriePlan,
} from '../services/nutritionEngine';

interface CalculatorsViewProps {
  profile: UserProfile;
  onApplyToProfile: (updated: UserProfile) => Promise<void> | void;
}

export const CalculatorsView: React.FC<CalculatorsViewProps> = ({
  profile,
  onApplyToProfile,
}) => {
  const [heightCm, setHeightCm] = useState(profile.heightCm);
  const [weightKg, setWeightKg] = useState(profile.weightKg);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile.fitnessGoal);
  const [applied, setApplied] = useState(false);

  const bmiResult = useMemo(() => calculateBMI(heightCm, weightKg), [heightCm, weightKg]);
  const caloriePlan = useMemo(
    () =>
      calculateCaloriePlan({
        age,
        gender,
        heightCm,
        weightKg,
        activityLevel,
        fitnessGoal,
      }),
    [age, gender, heightCm, weightKg, activityLevel, fitnessGoal]
  );

  // Compute BMI marker position along 14..38 scale
  const markerPercent = Math.max(
    2,
    Math.min(98, ((bmiResult.bmi - 14) / (38 - 14)) * 100)
  );

  const bmiCategoryColor =
    bmiResult.category === 'Normal'
      ? 'text-[#1B6B40]'
      : bmiResult.category === 'Underweight'
      ? 'text-[#2563EB]'
      : bmiResult.category === 'Overweight'
      ? 'text-[#B45309]'
      : 'text-[#B91C1C]';

  const handleApply = async () => {
    await onApplyToProfile({
      ...profile,
      age,
      gender,
      heightCm,
      weightKg,
      activityLevel,
      fitnessGoal,
      bmi: bmiResult.bmi,
      bmiCategory: bmiResult.category,
      dailyCalorieTarget: caloriePlan.targetCalories,
    });
    setApplied(true);
    setTimeout(() => setApplied(false), 2400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14231A] tracking-tight">
            BMI &amp; Daily Calorie Calculator
          </h1>
          <p className="text-sm text-[#526458] mt-1">
            Interactive biometric calculator powered by WHO BMI standards and the Mifflin-St Jeor
            equation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1B6B40] text-white text-sm font-medium hover:bg-[#14532D] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          {applied ? <Check className="w-4 h-4" /> : null}
          <span>{applied ? 'Saved to Your Profile' : 'Apply Targets to My Profile'}</span>
        </button>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: BMI Calculator */}
        <section className="lg:col-span-6 bg-white border border-[#E2E8DF] rounded-3xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-[#14231A]">BMI Calculator</h2>
              <p className="text-xs text-[#526458] mt-0.5">Body Mass Index &amp; healthy range</p>
            </div>
            <Scale className="w-5 h-5 text-[#1B6B40]" />
          </div>

          {/* Sliders */}
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <label htmlFor="calc-height" className="font-medium text-[#2A3B30]">
                  Height
                </label>
                <span className="font-mono font-semibold tabular-nums text-[#14231A]">
                  {heightCm} cm
                </span>
              </div>
              <input
                id="calc-height"
                type="range"
                min={120}
                max={220}
                step={0.5}
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full accent-[#1B6B40] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <label htmlFor="calc-weight" className="font-medium text-[#2A3B30]">
                  Weight
                </label>
                <span className="font-mono font-semibold tabular-nums text-[#14231A]">
                  {weightKg} kg
                </span>
              </div>
              <input
                id="calc-weight"
                type="range"
                min={30}
                max={160}
                step={0.5}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full accent-[#1B6B40] cursor-pointer"
              />
            </div>
          </div>

          {/* BMI Result Display */}
          <div className="p-5 rounded-2xl bg-[#F5F8F3] space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#526458] block">Calculated BMI</span>
                <span className="font-mono text-4xl font-semibold tabular-nums text-[#14231A]">
                  {bmiResult.bmi.toFixed(1)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#526458] block">Category</span>
                <span className={`font-display text-xl font-bold ${bmiCategoryColor}`}>
                  {bmiResult.category}
                </span>
              </div>
            </div>

            {/* Spectrum Gauge with Live Pointer */}
            <div className="pt-2">
              <div className="relative h-3 rounded-full overflow-hidden grid grid-cols-12">
                <div className="col-span-2 bg-[#60A5FA]" title="Underweight" />
                <div className="col-span-4 bg-[#1B6B40]" title="Normal" />
                <div className="col-span-3 bg-[#D97706]" title="Overweight" />
                <div className="col-span-3 bg-[#DC2626]" title="Obese" />
              </div>
              <div className="relative h-4">
                <div
                  className="absolute -top-1 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#14231A] border-2 border-white shadow-sm transition-all duration-200"
                  style={{ left: `${markerPercent}%` }}
                />
              </div>
              <div className="grid grid-cols-4 text-[11px] text-[#526458] mt-1">
                <span>Under &lt;18.5</span>
                <span>Normal 18.5–24.9</span>
                <span>Over 25–29.9</span>
                <span className="text-right">Obese ≥30</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2EAE0] space-y-2 text-xs text-[#374B3E]">
              <p className="font-medium">
                Healthy weight for {heightCm} cm:{' '}
                <span className="font-mono tabular-nums font-semibold text-[#14231A]">
                  {bmiResult.healthyMinKg} kg – {bmiResult.healthyMaxKg} kg
                </span>
              </p>
              <p className="text-[#526458] leading-relaxed">{bmiResult.guidance}</p>
            </div>
          </div>
        </section>

        {/* Right: Calorie & Macro Calculator */}
        <section className="lg:col-span-6 bg-white border border-[#E2E8DF] rounded-3xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-[#14231A]">
                Daily Calorie Calculator
              </h2>
              <p className="text-xs text-[#526458] mt-0.5">
                Mifflin-St Jeor BMR · TDEE · Goal-based targets
              </p>
            </div>
            <Flame className="w-5 h-5 text-[#1B6B40]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="calc-age" className="block text-xs font-medium text-[#374B3E] mb-1.5">
                Age (years)
              </label>
              <input
                id="calc-age"
                type="number"
                min={10}
                max={120}
                value={age}
                onChange={(e) => setAge(Math.max(10, Math.min(120, Number(e.target.value) || 20)))}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D8E1D5] bg-[#FAFBF9] font-mono text-sm tabular-nums text-[#14231A]"
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
                    className={`min-h-[36px] rounded-lg text-xs font-medium capitalize ${
                      gender === g
                        ? 'bg-white text-[#14231A] shadow-xs'
                        : 'text-[#526458]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="calc-activity"
              className="block text-xs font-medium text-[#374B3E] mb-1.5"
            >
              Activity Level
            </label>
            <select
              id="calc-activity"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D8E1D5] bg-[#FAFBF9] text-sm text-[#14231A]"
            >
              {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => (
                <option key={level} value={level}>
                  {ACTIVITY_MULTIPLIERS[level].label} (×{ACTIVITY_MULTIPLIERS[level].factor})
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-xs font-medium text-[#374B3E] mb-2">Fitness Goal</span>
            <div className="grid grid-cols-3 gap-2">
              {(['weight_loss', 'weight_maintenance', 'weight_gain'] as FitnessGoal[]).map(
                (goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setFitnessGoal(goal)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      fitnessGoal === goal
                        ? 'bg-[#1B6B40] border-[#1B6B40] text-white'
                        : 'bg-white border-[#D8E1D5] text-[#374B3E] hover:border-[#1B6B40]/50'
                    }`}
                  >
                    {GOAL_LABELS[goal].shortLabel}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Calculated Calorie Output */}
          <div className="p-5 rounded-2xl bg-[#14532D] text-white space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#C7E2CF] block">
                  Recommended Daily Target ({GOAL_LABELS[fitnessGoal].label})
                </span>
                <span className="font-mono text-3xl font-semibold tabular-nums">
                  {caloriePlan.targetCalories}{' '}
                  <span className="text-sm font-sans font-normal text-[#C7E2CF]">kcal/day</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/15 font-mono text-xs tabular-nums">
              <div>
                <span className="font-sans text-[#C7E2CF] block">Basal Metabolic Rate (BMR)</span>
                <span className="text-base font-semibold">{caloriePlan.bmr} kcal</span>
              </div>
              <div>
                <span className="font-sans text-[#C7E2CF] block">Maintenance TDEE</span>
                <span className="text-base font-semibold">{caloriePlan.tdee} kcal</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/15 text-center font-mono tabular-nums">
              <div className="p-2.5 rounded-xl bg-white/10">
                <div className="text-sm font-semibold">{caloriePlan.proteinTargetG}g</div>
                <div className="font-sans text-[11px] text-[#C7E2CF]">Protein</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10">
                <div className="text-sm font-semibold">{caloriePlan.carbsTargetG}g</div>
                <div className="font-sans text-[11px] text-[#C7E2CF]">Carbs</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10">
                <div className="text-sm font-semibold">{caloriePlan.fatTargetG}g</div>
                <div className="font-sans text-[11px] text-[#C7E2CF]">Fats</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
