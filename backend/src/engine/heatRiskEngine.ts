import { 
  ActivityType, DurationCategory, AgeGroup, HealthCondition, 
  HourlyEntry, UserInput, RiskResult, TimeWindow, Recommendation, RiskLevel, ScoreBreakdown 
} from '../../../shared/types';
import { 
  getActivityModifier, getDurationModifier, 
  getTimeModifier, getPersonalModifier 
} from './modifiers';

const calculateHeatIndex = (tempC: number, humidity: number): number => {
  // Steadman simplified formula
  const tf = (tempC * 9/5) + 32;
  const hi = -42.379 
    + 2.04901523 * tf 
    + 10.14333127 * humidity 
    - 0.22475541 * tf * humidity 
    - 0.00683783 * (tf * tf) 
    - 0.05391554 * (humidity * humidity) 
    + 0.00122874 * (tf * tf) * humidity 
    + 0.00085282 * tf * (humidity * humidity) 
    - 0.00000199 * (tf * tf) * (humidity * humidity);
    
  return (hi - 32) * 5/9; // Convert back to C
};

const getBaseScore = (hiC: number): number => {
  if (hiC < 27) return (hiC / 27) * 20;
  if (hiC < 32) return 20 + ((hiC - 27) / 5) * 20;
  if (hiC < 41) return 40 + ((hiC - 32) / 9) * 25;
  if (hiC < 54) return 65 + ((hiC - 41) / 13) * 20;
  return 85 + Math.min(((hiC - 54) / 10) * 15, 15);
};

const getLevel = (score: number): RiskLevel => {
  if (score <= 25) return 'low';
  if (score <= 50) return 'moderate';
  if (score <= 75) return 'high';
  return 'extreme';
};

export const calculateRisk = (input: UserInput): RiskResult => {
  const { temperature, humidity, currentHour, activityType, duration, ageGroup, healthConditions, hourlyForecast } = input;
  
  const heatIndex = calculateHeatIndex(temperature, humidity);
  const base = getBaseScore(heatIndex);
  
  const activityMod = getActivityModifier(activityType);
  const durationMod = getDurationModifier(duration);
  const timeMod = getTimeModifier(currentHour);
  const personalMod = getPersonalModifier(ageGroup, healthConditions);
  
  let totalScore = base + activityMod + durationMod + timeMod + personalMod;
  totalScore = Math.max(0, Math.min(100, totalScore)); // clamp 0-100
  
  const breakdown: ScoreBreakdown = {
    base: Math.round(base),
    activityModifier: activityMod,
    durationModifier: durationMod,
    timeModifier: timeMod,
    personalModifier: personalMod,
    total: Math.round(totalScore)
  };

  const level = getLevel(totalScore);
  
  // Exps
  const explanations: string[] = [];
  explanations.push(`Heat Index of ${heatIndex.toFixed(1)}°C indicates apparent temperature.`);
  if (activityMod > 0) explanations.push(`${activityType} adds metabolic heat.`);
  if (timeMod > 0) explanations.push(`Time of day adds risk factor.`);
  if (personalMod > 0) explanations.push(`Personal factors (age/health) increase sensitivity.`);

  // Hourly Risk Calculation
  const hourlyRisk = hourlyForecast.map(entry => {
    const hrHeatIndex = calculateHeatIndex(entry.temperature, entry.humidity);
    const hrBase = getBaseScore(hrHeatIndex);
    const hrTimeMod = getTimeModifier(entry.hour);
    
    let hrTotal = hrBase + activityMod + durationMod + hrTimeMod + personalMod;
    hrTotal = Math.max(0, Math.min(100, hrTotal));
    
    return {
      hour: entry.hour,
      score: Math.round(hrTotal),
      level: getLevel(hrTotal)
    };
  });
  
  // Safe Windows
  const safeWindows: TimeWindow[] = [];
  let currentWindow: TimeWindow | null = null;
  
  for (const hr of hourlyRisk) {
    if (hr.level === 'low' || hr.level === 'moderate') {
      if (!currentWindow) {
        currentWindow = { start: hr.hour, end: hr.hour, level: hr.level };
      } else {
        currentWindow.end = hr.hour;
        // escalate level if any hour is moderate
        if (hr.level === 'moderate') currentWindow.level = 'moderate';
      }
    } else {
      if (currentWindow) {
        safeWindows.push(currentWindow);
        currentWindow = null;
      }
    }
  }
  if (currentWindow) safeWindows.push(currentWindow);
  
  let bestWindow: TimeWindow | null = null;
  if (safeWindows.length > 0) {
    bestWindow = safeWindows.reduce((prev, current) => {
      const prevDur = prev.end - prev.start;
      const currDur = current.end - current.start;
      return (currDur > prevDur) ? current : prev;
    });
  }
  
  // Recommendations
  const recommendations: Recommendation[] = [];
  if (level === 'extreme') recommendations.push({ type: 'warning', text: 'Do NOT perform this activity outdoors today.' });
  else if (level === 'high') recommendations.push({ type: 'warning', text: 'Avoid this activity at this time of day.' });
  else if (level === 'moderate') recommendations.push({ type: 'action', text: 'Proceed with caution and monitor symptoms.' });
  else recommendations.push({ type: 'action', text: 'Conditions are safe. Enjoy your activity!' });
  
  if (bestWindow) recommendations.push({ type: 'tip', text: `Best window today: ${bestWindow.start}:00 – ${bestWindow.end}:00` });
  
  if (totalScore > 40) recommendations.push({ type: 'tip', text: 'Drink at least 500ml of water before starting.' });
  if (totalScore > 50) recommendations.push({ type: 'tip', text: 'Take a break every 10–15 minutes in shade.' });
  if (totalScore > 60) recommendations.push({ type: 'tip', text: 'Wear light-colored, loose-fitting clothing.' });
  if (totalScore > 70) recommendations.push({ type: 'tip', text: 'Have oral rehydration salts available.' });
  
  if (ageGroup === 'senior' || ageGroup === 'child') recommendations.push({ type: 'tip', text: 'Extra caution required for your age group.' });
  if (healthConditions.includes('heart')) recommendations.push({ type: 'warning', text: 'Consult your doctor before outdoor exertion in heat.' });

  return {
    score: Math.round(totalScore),
    level,
    heatIndex: Math.round(heatIndex * 10) / 10,
    scoreBreakdown: breakdown,
    explanations,
    hourlyRisk,
    safeWindows,
    bestWindow,
    recommendations
  };
};
