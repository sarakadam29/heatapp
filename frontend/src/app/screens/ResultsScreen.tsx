import React from 'react';
import { useHeatGuardStore } from '../store/useHeatGuardStore';
import { RiskBadge } from './ui/RiskBadge';
import { RiskScoreGauge } from './ui/RiskScoreGauge';
import { TimeWindowStrip } from './ui/TimeWindowStrip';
import { useNavigate } from 'react-router-dom';

export const ResultsScreen: React.FC = () => {
  const store = useHeatGuardStore();
  const navigate = useNavigate();

  if (!store.riskResult) {
    // If no result is present, return to input form
    navigate('/');
    return null;
  }

  const { score, level, explanations, hourlyRisk, bestWindow, recommendations } = store.riskResult;
  const { temperature, humidity, currentHour, activityType, duration, ageGroup } = store.userInput;

  return (
    <div className="max-w-[720px] mx-auto pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
          <span>←</span> Back
        </button>
        <button onClick={() => store.calculateRisk()} className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center gap-1 transition-colors">
          Recalculate <span>↺</span>
        </button>
      </div>

      {/* Hero Risk Card */}
      <section 
        className="rounded-3xl p-8 mb-6 border relative overflow-hidden flex flex-col items-center text-center shadow-2xl"
        style={{ 
          borderColor: level === 'low' ? '#22C55E80' : level === 'moderate' ? '#EAB30880' : level === 'high' ? '#F9731680' : '#EF444480',
          backgroundColor: '#1E293B',
          boxShadow: `0 20px 40px -10px ${level === 'low' ? '#22C55E20' : level === 'moderate' ? '#EAB30820' : level === 'high' ? '#F9731620' : '#EF444420'}`
        }}
      >
        <div className="mb-4">
          <RiskBadge level={level} />
        </div>
        
        <div className="my-6">
          <RiskScoreGauge score={score} level={level} />
        </div>

        <div className="mt-4 text-slate-300 text-sm font-medium bg-slate-800/50 py-3 px-6 rounded-xl border border-slate-700/50">
          <span className="text-white">{temperature}°C</span> · {humidity}% humidity · <span className="capitalize text-white">{activityType}</span> · {duration}
          <div className="mt-1 text-slate-400">
             {currentHour}:00 · <span className="capitalize">{ageGroup}</span>
          </div>
        </div>
      </section>

      {/* Why This Risk Level */}
      <section className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-xl border border-slate-700">
        <h2 className="text-sm uppercase tracking-widest font-semibold text-slate-400 mb-4 flex items-center gap-2">
          <span>📋</span> Why This Risk Level
        </h2>
        <ul className="space-y-3">
          {explanations.map((exp, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
              <span className="text-slate-500 mt-0.5">•</span>
              {exp}
            </li>
          ))}
        </ul>
      </section>

      {/* Safe Time Windows */}
      <section className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-xl border border-slate-700">
        <h2 className="text-sm uppercase tracking-widest font-semibold text-slate-400 mb-2 flex items-center gap-2">
          <span>⏰</span> Safe Time Windows — Today
        </h2>
        
        <TimeWindowStrip data={hourlyRisk} currentHour={currentHour as number} />
        
        <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3">
           <div className="flex items-center gap-3 text-sm">
             <div className="w-3 h-3 rounded-full bg-[#22C55E]"></div>
             <span className="text-slate-300">Low (<span className="text-slate-400">Recommended</span>)</span>
           </div>
           <div className="flex items-center gap-3 text-sm">
             <div className="w-3 h-3 rounded-full bg-[#EAB308]"></div>
             <span className="text-slate-300">Moderate</span>
           </div>
           <div className="flex items-center gap-3 text-sm">
             <div className="w-3 h-3 rounded-full bg-[#F97316]"></div>
             <span className="text-slate-300">High <span className="text-slate-500 ml-2">← You are here</span></span>
           </div>
           
           {bestWindow && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                 <span className="text-xl">⭐️</span>
                 <div>
                   <div className="text-green-400 font-semibold text-sm">Best window today</div>
                   <div className="text-slate-200 text-sm mt-1">{bestWindow.start}:00 – {bestWindow.end}:00</div>
                 </div>
              </div>
           )}
        </div>
      </section>

      {/* Safety Recommendations */}
      <section className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-xl border border-slate-700">
        <h2 className="text-sm uppercase tracking-widest font-semibold text-slate-400 mb-6 flex items-center gap-2">
          <span>💡</span> Safety Recommendations
        </h2>
        
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
             <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl border ${
               rec.type === 'warning' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
               rec.type === 'action' ? 'bg-orange-500/10 border-orange-500/20 text-orange-200' :
               'bg-slate-700/30 border-slate-700/50 text-slate-300'
             }`}>
               <span className="text-lg">
                 {rec.type === 'warning' ? '⚠️' : rec.type === 'action' ? '→' : '✓'}
               </span>
               <div className={`text-sm ${rec.type === 'warning' ? 'font-medium' : ''}`}>
                 {rec.text}
               </div>
             </div>
          ))}
        </div>
      </section>
      
    </div>
  );
};
