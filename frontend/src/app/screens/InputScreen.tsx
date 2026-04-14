import React, { useEffect } from 'react';
import { useHeatGuardStore } from '../store/useHeatGuardStore';
import { ActivityCard } from './ui/ActivityCard';
import { ActivityType, DurationCategory, AgeGroup, HealthCondition } from '../../../../shared/types';
import { useNavigate } from 'react-router-dom';

export const InputScreen: React.FC = () => {
  const store = useHeatGuardStore();
  const navigate = useNavigate();

  // Load weather when component mounts
  useEffect(() => {
    store.fetchWeather('Mumbai');
  }, []);

  const activities: { type: ActivityType; label: string; icon: string }[] = [
    { type: 'walking', label: 'Walk', icon: '🚶' },
    { type: 'running', label: 'Run', icon: '🏃' },
    { type: 'cycling', label: 'Cycle', icon: '🚴' },
    { type: 'sports', label: 'Sport', icon: '⚽' },
    { type: 'labor', label: 'Work', icon: '🏋️' },
    { type: 'hiking', label: 'Hike', icon: '🌳' },
  ];

  const handleCalculate = async () => {
    await store.calculateRisk();
    if (!store.error) {
       navigate('/results');
    }
  };

  const toggleCondition = (cond: HealthCondition) => {
    const arr = store.userInput.healthConditions || [];
    if (arr.includes(cond)) {
      store.setUserInput({ healthConditions: arr.filter(c => c !== cond) });
    } else {
      store.setUserInput({ healthConditions: [...arr, cond] });
    }
  };

  if (store.isLoading && !store.weatherData) {
    return <div className="p-8 text-center text-slate-400">Loading live weather data...</div>;
  }

  return (
    <div className="max-w-[680px] mx-auto pb-24">
      {store.error && (
         <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg my-4 text-sm font-medium">
           {store.error}
         </div>
      )}

      {/* Weather Conditions Card */}
      <section className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-xl border border-slate-700">
        <h2 className="text-sm uppercase tracking-widest font-semibold text-slate-400 mb-6 flex items-center gap-2">
          <span>📍</span> Weather Conditions
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700 rounded-xl p-4 cursor-pointer hover:bg-slate-600 transition-colors">
            <label className="text-xs text-slate-400 uppercase tracking-wide block mb-1">Temperature</label>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-100">{store.userInput.temperature}°C</span>
            </div>
          </div>
          <div className="bg-slate-700 rounded-xl p-4 cursor-pointer hover:bg-slate-600 transition-colors">
            <label className="text-xs text-slate-400 uppercase tracking-wide block mb-1">Humidity</label>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-100">{store.userInput.humidity}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Card */}
      <section className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-xl border border-slate-700">
        <h2 className="text-sm uppercase tracking-widest font-semibold text-slate-400 mb-6 flex items-center gap-2">
          <span>🏃</span> Your Activity
        </h2>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
          {activities.map(act => (
            <ActivityCard
              key={act.type}
              type={act.type}
              label={act.label}
              icon={act.icon}
              selected={store.userInput.activityType === act.type}
              onClick={() => store.setUserInput({ activityType: act.type })}
            />
          ))}
        </div>

        <div className="space-y-3">
          <label className="text-sm text-slate-300 font-medium">Target Duration</label>
          <div className="flex gap-4 bg-slate-700/50 p-2 rounded-xl">
             {['<30', '30-60', '>60'].map((dur) => (
                <button 
                  key={dur}
                  onClick={() => store.setUserInput({ duration: dur as DurationCategory })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${store.userInput.duration === dur ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {dur} {dur.includes('min') ? '' : 'min'}
                </button>
             ))}
          </div>
        </div>
      </section>

      {/* Personal Factors */}
      <section className="bg-slate-800 rounded-2xl p-6 mb-8 shadow-xl border border-slate-700">
        <h2 className="text-sm uppercase tracking-widest font-semibold text-slate-400 mb-6 flex items-center gap-2">
          <span>👤</span> Personal Factors
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm text-slate-300 font-medium mb-3 block">Age Group</label>
            <div className="flex gap-4">
              {['child', 'adult', 'senior'].map(age => (
                <label key={age} className="flex items-center gap-2 cursor-pointer text-slate-300 text-sm capitalize">
                   <input 
                     type="radio" 
                     name="ageGroup" 
                     checked={store.userInput.ageGroup === age} 
                     onChange={() => store.setUserInput({ ageGroup: age as AgeGroup })}
                     className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 focus:ring-orange-500 focus:ring-offset-slate-800"
                   />
                   {age}
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm text-slate-300 font-medium mb-3 block">Health Conditions (Optional)</label>
            <div className="grid grid-cols-2 gap-3">
              {['heart', 'diabetes', 'respiratory', 'pregnant'].map(cond => (
                <label key={cond} className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200 transition-colors text-sm capitalize bg-slate-700/30 p-3 rounded-lg border border-slate-700/50">
                  <input 
                    type="checkbox" 
                    checked={(store.userInput.healthConditions || []).includes(cond as HealthCondition)}
                    onChange={() => toggleCondition(cond as HealthCondition)}
                    className="w-4 h-4 text-orange-500 rounded bg-slate-700 border-slate-600 focus:ring-orange-500 focus:ring-offset-slate-800"
                  />
                  {cond}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <button 
        onClick={handleCalculate}
        disabled={store.isLoading}
        className="w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-slate-900 font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {store.isLoading ? 'Calculating...' : 'Calculate My Heat Risk'}
        {!store.isLoading && <span>→</span>}
      </button>
    </div>
  );
};
