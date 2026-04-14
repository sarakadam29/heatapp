import React from 'react';
import { RiskLevel } from '../../../../../shared/types';

interface RiskBadgeProps {
  level: RiskLevel;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const getStyles = () => {
    switch (level) {
      case 'low':
        return { bg: 'bg-[rgba(34,197,94,0.15)]', text: 'text-[#22C55E]', border: 'border-[#22C55E]/40', dot: 'bg-[#22C55E]' };
      case 'moderate':
        return { bg: 'bg-[rgba(234,179,8,0.15)]', text: 'text-[#EAB308]', border: 'border-[#EAB308]/40', dot: 'bg-[#EAB308]' };
      case 'high':
        return { bg: 'bg-[rgba(249,115,22,0.15)]', text: 'text-[#F97316]', border: 'border-[#F97316]/40', dot: 'bg-[#F97316]' };
      case 'extreme':
        return { bg: 'bg-[rgba(239,68,68,0.15)]', text: 'text-[#EF4444]', border: 'border-[#EF4444]/40', dot: 'bg-[#EF4444]' };
      default:
        return { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700', dot: 'bg-slate-500' };
    }
  };

  const s = getStyles();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${s.bg} ${s.border}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot} shadow-[0_0_8px_currentColor]`} style={{ color: s.dot.replace('bg-[', '').replace(']', '') }}></span>
      <span className={`text-[12px] font-semibold uppercase tracking-wider ${s.text}`}>
        {level} RISK
      </span>
    </div>
  );
};
