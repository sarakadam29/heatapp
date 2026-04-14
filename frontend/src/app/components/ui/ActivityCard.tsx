import React from 'react';

interface ActivityCardProps {
  type: string;
  label: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ type, label, icon, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative w-[72px] h-[80px] rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-200 border-2
        ${selected 
          ? 'bg-orange-500/10 border-orange-500 transform scale-95 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
          : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-500'}`}
      type="button"
    >
      <span className="text-[28px]">{icon}</span>
      <span className="text-[11px] font-medium text-slate-200">{label}</span>
    </button>
  );
};
