export interface WeatherData {
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    apparent_temperature: number[];
    uv_index: number[];
    wind_speed_10m: number[];
  };
}

export async function fetchWeather(lat: number = 28.61, lon: number = 77.23): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,uv_index,wind_speed_10m&forecast_days=1&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  
  return response.json();
}
