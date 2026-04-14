import React, { useEffect, useState } from 'react';
import { RiskLevel } from '../../../../../shared/types';

interface RiskScoreGaugeProps {
  score: number;
  level: RiskLevel;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ score, level }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score from 0 to target
    const duration = 600;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = score / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  const getColor = () => {
    switch(level) {
      case 'low': return '#22C55E';
      case 'moderate': return '#EAB308';
      case 'high': return '#F97316';
      case 'extreme': return '#EF4444';
      default: return '#334155';
    }
  };

  const radius = 60;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * (circumference / 2); // Half circle

  return (
    <div className="relative flex flex-col items-center justify-center w-[140px] h-[100px] overflow-hidden drop-shadow-xl" style={{ filter: `drop-shadow(0 8px 32px ${getColor()}40)` }}>
      <svg
        height="140"
        width="140"
        className="absolute top-0 transform -rotate-180"
      >
        <circle
          stroke="#334155"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference / 2} ${circumference}`}
          r={normalizedRadius}
          cx="70"
          cy="70"
        />
        <circle
          stroke={getColor()}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.1s linear' }}
          r={normalizedRadius}
          cx="70"
          cy="70"
        />
      </svg>
      <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center">
        <span className="text-4xl font-extrabold tracking-tighter" style={{ color: getColor() }}>{animatedScore}</span>
        <span className="text-xs uppercase text-slate-400 tracking-widest -mt-1 font-semibold">/ 100</span>
      </div>
    </div>
  );
};
