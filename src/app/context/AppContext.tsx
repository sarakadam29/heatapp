import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchWeather, WeatherData } from "../services/weatherApi";
import { computeHeatRisk, RiskResult } from "../services/heatRiskEngine";

export interface UserProfile {
  name: string;
  location: string;
  age: number;
  fitnessLevel: string;
  healthConditions: string[];
  defaultActivity: string;
  workoutTime: string;
}

interface ActivityItem {
  id: number;
  type: string;
  label: string;
  date: string;
  time: string;
  score: number;
  status: string;
  temp: string;
  uv: string;
  aqi: string;
  duration: string;
  emoji: string;
}

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  history: ActivityItem[];
  addToHistory: (activity: Omit<ActivityItem, "id">) => void;
  saveProfile: () => void;
  weather: WeatherData | null;
  loading: boolean;
  getRisk: (activity: string, timeStr: string) => RiskResult | null;
  coords: { lat: number; lon: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USER: UserProfile = {
  name: "User",
  location: "Detecting...",
  age: 28,
  fitnessLevel: "Moderate",
  healthConditions: ["None"],
  defaultActivity: "Running",
  workoutTime: "Morning",
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("fitweather_profile");
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [history, setHistory] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem("fitweather_history");
    return saved ? JSON.parse(saved) : [];
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({ lat: 28.61, lon: 77.23 });

  useEffect(() => {
    const init = async () => {
      let lat = 28.61; // Default New Delhi
      let lon = 77.23;
      let locationName = user.location;

      const getPosition = (): Promise<GeolocationPosition> => 
        new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));

      const reverseGeocode = async (lt: number, ln: number) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lt}&lon=${ln}`);
          const data = await res.json();
          return data.address.city || data.address.town || data.address.village || data.display_name.split(",")[0];
        } catch (e) {
          return "Detected Location";
        }
      };

      try {
        setLoading(true);
        // Step 1: Detect Geolocation
        try {
          const pos = await getPosition();
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
          setCoords({ lat, lon });
          
          // Step 2: Get Location Name
          locationName = await reverseGeocode(lat, lon);
          setUser(prev => ({ ...prev, location: locationName }));
        } catch (geoErr) {
          console.warn("Geolocation denied or failed, using default.");
          if (user.location === "Detecting...") {
            setUser(prev => ({ ...prev, location: "New Delhi, India" }));
          }
        }

        // Step 3: Fetch Weather for detecting/default coordinates
        const data = await fetchWeather(lat, lon);
        setWeather(data);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const saveProfile = () => {
    localStorage.setItem("fitweather_profile", JSON.stringify(user));
  };

  const addToHistory = (activity: Omit<ActivityItem, "id">) => {
    const newItem = { ...activity, id: Date.now() };
    const newHistory = [newItem, ...history];
    setHistory(newHistory);
    localStorage.setItem("fitweather_history", JSON.stringify(newHistory));
  };

  const getRisk = (activity: string, timeStr: string): RiskResult | null => {
    if (!weather) return null;

    // Find closest index in 24hr forecast
    // Simplified: timeStr is 5am, 6am... mapping to indices 5, 6...
    let hour = parseInt(timeStr.replace(/[^0-9]/g, ""));
    const isPm = timeStr.toLowerCase().includes("pm");
    if (isPm && hour < 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;

    const idx = Math.min(23, hour);
    const data = weather.hourly;

    return computeHeatRisk(
      data.temperature_2m[idx],
      data.apparent_temperature[idx],
      data.relative_humidity_2m[idx],
      data.uv_index[idx],
      data.wind_speed_10m[idx],
      activity,
      user
    );
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, history, addToHistory, saveProfile, 
      weather, loading, getRisk, coords
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
