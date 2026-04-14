import { create } from 'zustand';
import axios from 'axios';
import { UserInput, RiskResult, HourlyEntry, ActivityType, DurationCategory, AgeGroup, HealthCondition } from '../../../shared/types';

interface HeatGuardStore {
  weatherSource: 'live' | 'mock';
  weatherData: any | null;
  hourlyForecast: HourlyEntry[];
  
  userInput: Partial<UserInput>;
  riskResult: RiskResult | null;
  
  isLoading: boolean;
  error: string | null;

  fetchWeather: (city: string) => Promise<void>;
  setUserInput: (input: Partial<UserInput>) => void;
  calculateRisk: () => Promise<void>;
  reset: () => void;
}

export const useHeatGuardStore = create<HeatGuardStore>((set, get) => ({
  weatherSource: 'live',
  weatherData: null,
  hourlyForecast: [],
  
  userInput: {
    activityType: 'walking',
    duration: '30-60',
    ageGroup: 'adult',
    healthConditions: []
  },
  riskResult: null,
  
  isLoading: false,
  error: null,

  fetchWeather: async (city: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:3001/api/weather?city=${city}`);
      set({ 
        weatherData: response.data,
        weatherSource: response.data.source,
        hourlyForecast: response.data.hourlyForecast,
        userInput: { 
          ...get().userInput, 
          temperature: response.data.temperature,
          humidity: response.data.humidity,
          currentHour: response.data.currentHour,
          hourlyForecast: response.data.hourlyForecast
        },
        isLoading: false
      });
    } catch (err) {
      set({ error: 'Failed to fetch weather data.', isLoading: false });
    }
  },

  setUserInput: (input) => set((state) => ({ 
    userInput: { ...state.userInput, ...input } 
  })),

  calculateRisk: async () => {
    set({ isLoading: true, error: null });
    try {
      const input = get().userInput as UserInput;
      const response = await axios.post('http://localhost:3001/api/calculate', input);
      set({ riskResult: response.data as RiskResult, isLoading: false });
    } catch (err: any) {
       set({ 
         error: err.response?.data?.details?.[0]?.message || 'Failed to calculate heat risk.', 
         isLoading: false 
       });
    }
  },

  reset: () => set({ riskResult: null, error: null })
}));
