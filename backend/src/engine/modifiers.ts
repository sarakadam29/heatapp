import { ActivityType, DurationCategory, AgeGroup, HealthCondition } from '../../../shared/types';

export const getActivityModifier = (type: ActivityType): number => {
  const mods: Record<ActivityType, number> = {
    walking: 0,
    running: 6,
    cycling: 4,
    sports: 5,
    labor: 3,
    hiking: 5,
  };
  return mods[type] || 0;
};

export const getDurationModifier = (duration: DurationCategory): number => {
  switch (duration) {
    case '<30': return 0;
    case '30-60': return 5;
    case '>60': return 10;
    default: return 0;
  }
};

export const getTimeModifier = (hour: number): number => {
  if (hour < 6) return -5;
  if (hour < 9) return 0;
  if (hour < 11) return 4;
  if (hour < 15) return 10;
  if (hour < 17) return 8;
  if (hour < 19) return 4;
  return 0; // 19 to 23
};

export const getPersonalModifier = (ageGroup: AgeGroup, conditions: HealthCondition[]): number => {
  let mod = 0;
  // Age sum
  if (ageGroup === 'child') mod += 8;
  else if (ageGroup === 'senior') mod += 10;
  
  // Conditions sum is capped at 15
  let conditionsMod = 0;
  for (const c of conditions) {
    if (c === 'heart') conditionsMod += 6;
    if (c === 'diabetes') conditionsMod += 4;
    if (c === 'respiratory') conditionsMod += 5;
    if (c === 'pregnant') conditionsMod += 7;
  }
  conditionsMod = Math.min(conditionsMod, 15);
  
  return mod + conditionsMod;
};
