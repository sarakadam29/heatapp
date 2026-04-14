import { UserProfile } from "../context/AppContext";

export interface RiskFactor {
  name: string;
  value: string;
  risk: "low" | "moderate" | "high";
  pct: number;
}

export interface RiskResult {
  score: number;
  verdict: "safe" | "caution" | "danger";
  factors: RiskFactor[];
  recommendation: string;
}

/**
 * HEAT RISK SCORE ENGINE (Multi-Factor Decision Tree / Weighted Heuristic)
 * 
 * Logic:
 * 1. Base Score starts at 100.
 * 2. Heat Index Impact: Uses apparent temperature. >35°C is high risk.
 * 3. Activity Weighting: Running is harder than Walking.
 * 4. Environmental Penalties: High UV (>7) or High Humidity (>70%) reduce score.
 * 5. Personal Penalties: Age >50, pre-existing conditions.
 * 6. Environmental Bonuses: Wind speed > 15km/h provides convective cooling.
 */
export function computeHeatRisk(
  temp: number,
  apparentTemp: number,
  humidity: number,
  uv: number,
  wind: number,
  activity: string,
  user: UserProfile
): RiskResult {
  let score = 100;
  const factors: RiskFactor[] = [];

  // 1. Apparent Temp factor (Heat Index)
  // Weighted highly. If HI > 40, significant danger.
  let tempRisk: "low" | "moderate" | "high" = "low";
  let tempPct = Math.min(100, (apparentTemp / 45) * 100);
  if (apparentTemp > 38) {
    score -= 35;
    tempRisk = "high";
  } else if (apparentTemp > 32) {
    score -= 15;
    tempRisk = "moderate";
  }
  factors.push({ name: "Heat Index", value: `${Math.round(apparentTemp)}°C`, risk: tempRisk, pct: tempPct });

  // 2. UV Index factor
  let uvRisk: "low" | "moderate" | "high" = "low";
  if (uv > 8) {
    score -= 20;
    uvRisk = "high";
  } else if (uv > 5) {
    score -= 10;
    uvRisk = "moderate";
  }
  factors.push({ name: "UV Index", value: `${Math.round(uv)} High`, risk: uvRisk, pct: (uv / 12) * 100 });

  // 3. Humidity factor
  let humRisk: "low" | "moderate" | "high" = "low";
  if (humidity > 70) {
    score -= 10;
    humRisk = "high";
  } else if (humidity > 50) {
    score -= 5;
    humRisk = "moderate";
  }
  factors.push({ name: "Humidity", value: `${humidity}%`, risk: humRisk, pct: humidity });

  // 4. Activity Multiplier
  const intensity = activity.toLowerCase();
  if (intensity === "run") {
    score -= 15; // Running raises core temp faster
  } else if (intensity === "cycle") {
    score -= 5;
  }

  // 5. Personal Profile (Age)
  let ageRisk: "low" | "moderate" | "high" = "low";
  if (user.age > 60) {
    score -= 25;
    ageRisk = "high";
  } else if (user.age > 45) {
    score -= 15;
    ageRisk = "moderate";
  }
  factors.push({ name: "Age Factor", value: `${user.age} yrs`, risk: ageRisk, pct: Math.min(100, user.age * 1.2) });

  // 6. Health Conditions
  const hasConditions = user.healthConditions.length > 0 && !user.healthConditions.includes("None");
  if (hasConditions) {
    score -= 20;
    factors.push({ name: "Health Profile", value: user.healthConditions[0], risk: "high", pct: 80 });
  } else {
    factors.push({ name: "Health Profile", value: "Clear", risk: "low", pct: 10 });
  }

  // 7. Wind Bonus (Cooling effect)
  if (wind > 15) {
    score += 5;
  }

  // Clamp score
  score = Math.max(5, Math.min(100, score));

  // Determine Verdict
  let verdict: "safe" | "caution" | "danger" = "safe";
  if (score < 45) verdict = "danger";
  else if (score < 75) verdict = "caution";

  // Recommendation logic
  let recommendation = "";
  if (verdict === "safe") {
    recommendation = "Great time for activity! Stay hydrated and enjoy the weather.";
  } else if (verdict === "caution") {
    recommendation = "Be cautious. Wear light clothing, take frequent breaks, and double your water intake.";
  } else {
    recommendation = "Extreme conditions. We recommend staying indoors or switching to a light indoor workout.";
  }

  return { score, verdict, factors, recommendation };
}
