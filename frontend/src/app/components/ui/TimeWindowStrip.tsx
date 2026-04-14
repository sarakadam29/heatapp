import React from 'react';
import { RiskLevel } from '../../../../../shared/types';

interface TimeWindowStripProps {
  data: Array<{ hour: number; score: number; level: RiskLevel }>;
  currentHour: number;
}

export const TimeWindowStrip: React.FC<TimeWindowStripProps> = ({ data, currentHour }) => {
  const getColor = (level: RiskLevel) => {
    switch (level) {
      case 'low': return 'bg-[#22C55E]';
      case 'moderate': return 'bg-[#EAB308]';
      case 'high': return 'bg-[#F97316]';
      case 'extreme': return 'bg-[#EF4444]';
      default: return 'bg-slate-700';
    }
  };

  return (
    <div className="w-full overflow-x-auto py-4 scrollbar-hide">
      <div className="flex items-end gap-1 px-1 min-w-max">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 group relative">
            <span className="text-[10px] text-slate-500 font-medium">
              {item.hour.toString().padStart(2, '0')}
            </span>
            <div 
              className={`w-8 h-8 rounded-md transition-transform duration-200 cursor-pointer hover:scale-110 ${getColor(item.level)}
                ${currentHour === item.hour ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 border border-slate-900 shadow-lg' : 'opacity-80 hover:opacity-100'}
              `}
              title={`${item.hour}:00 — ${item.level.toUpperCase()} Risk (Score: ${item.score})`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
