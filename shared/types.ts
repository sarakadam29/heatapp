export type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme';

export type ActivityType = 'walking' | 'running' | 'cycling' | 'sports' | 'labor' | 'hiking';

export type DurationCategory = '<30' | '30-60' | '>60';

export type AgeGroup = 'child' | 'adult' | 'senior';

export type HealthCondition = 'heart' | 'diabetes' | 'respiratory' | 'pregnant';

export interface HourlyEntry {
  hour: number;          // 0–23
  temperature: number;   // °C
  humidity: number;      // %
}

export interface UserInput {
  temperature: number;
  humidity: number;
  currentHour: number;
  activityType: ActivityType;
  duration: DurationCategory;
  ageGroup: AgeGroup;
  healthConditions: HealthCondition[];
  hourlyForecast: HourlyEntry[];
}

export interface ScoreBreakdown {
  base: number;
  activityModifier: number;
  durationModifier: number;
  timeModifier: number;
  personalModifier: number;
  total: number;
}

export interface TimeWindow {
  start: number;
  end: number;
  level: 'low' | 'moderate';
}

export interface Recommendation {
  type: 'warning' | 'tip' | 'action';
  text: string;
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  heatIndex: number;
  scoreBreakdown: ScoreBreakdown;
  explanations: string[];
  hourlyRisk: Array<{ hour: number; score: number; level: RiskLevel }>;
  safeWindows: TimeWindow[];
  bestWindow: TimeWindow | null;
  recommendations: Recommendation[];
}
