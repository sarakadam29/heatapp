import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Wind, Thermometer, Droplets, Activity, MapPin, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAppContext } from "../context/AppContext";

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const layers = [
  { id: "wind", label: "Wind", icon: Wind, color: "#7DBF72" },
  { id: "temp", label: "Temp", icon: Thermometer, color: "#E8B94F" },
  { id: "humidity", label: "Hum", icon: Droplets, color: "#6EA8D9" },
  { id: "aqi", label: "AQI", icon: Activity, color: "#D96B4E" },
];

const statusColors = {
  safe: "#7DBF72",
  caution: "#E8B94F",
  danger: "#D96B4E",
};

const legendColors = [
  { color: "#7DBF72" },
  { color: "#A8D068" },
  { color: "#E8B94F" },
  { color: "#D99040" },
  { color: "#D96B4E" },
];

// Component to fly to new coordinates
function MapFlyTo({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 13, { animate: true, duration: 1.5 });
  }, [lat, lon, map]);
  return null;
}

// Generate nearby activity spots based on user coords
function generateNearbyPlaces(lat: number, lon: number, weather: any) {
  const currentHour = new Date().getHours();
  const temp = weather ? Math.round(weather.hourly.temperature_2m[currentHour]) : 30;
  const uv = weather ? Math.round(weather.hourly.uv_index[currentHour]) : 5;

  const baseScore = uv > 8 ? 45 : uv > 5 ? 65 : 85;

  return [
    {
      name: "Nearest Park",
      type: "Park · 0.8 km",
      score: Math.min(100, baseScore + 5),
      status: baseScore > 74 ? "safe" : baseScore > 44 ? "caution" : "danger",
      temp: `${temp}°C`,
      aqi: uv > 8 ? "High UV" : "Moderate",
      lat: lat + 0.007,
      lon: lon + 0.005,
    },
    {
      name: "City Loop Trail",
      type: "Route · 2.4 km",
      score: Math.max(10, baseScore - 20),
      status: (baseScore - 20) > 74 ? "safe" : (baseScore - 20) > 44 ? "caution" : "danger",
      temp: `${temp + 2}°C`,
      aqi: uv > 6 ? "High UV" : "Low",
      lat: lat - 0.005,
      lon: lon + 0.01,
    },
    {
      name: "Lakeside Walk",
      type: "Trail · 3.2 km",
      score: Math.min(100, baseScore + 10),
      status: (baseScore + 10) > 74 ? "safe" : (baseScore + 10) > 44 ? "caution" : "danger",
      temp: `${temp - 1}°C`,
      aqi: "Moderate",
      lat: lat + 0.012,
      lon: lon - 0.008,
    },
    {
      name: "Hilltop Viewpoint",
      type: "Outdoor · 4.1 km",
      score: Math.max(10, baseScore - 30),
      status: (baseScore - 30) > 74 ? "safe" : (baseScore - 30) > 44 ? "caution" : "danger",
      temp: `${temp + 3}°C`,
      aqi: uv > 7 ? "Very High" : "High",
      lat: lat - 0.01,
      lon: lon - 0.006,
    },
  ];
}

export function MapPage() {
  const { coords, weather, user, loading } = useAppContext();
  const [activeLayer, setActiveLayer] = useState("temp");
  const [search, setSearch] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);

  const nearbyPlaces = generateNearbyPlaces(coords.lat, coords.lon, weather);

  const customIcon = (color: string) => L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid #F5EDD8;
      box-shadow:0 0 8px ${color}80;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  const userIcon = L.divIcon({
    className: "",
    html: `<div style="position:relative;width:20px;height:20px;">
      <div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(232,185,79,0.25);animation:fw-pulse 2s infinite;"></div>
      <div style="width:20px;height:20px;border-radius:50%;background:#E8B94F;border:3px solid #F5EDD8;box-shadow:0 0 14px rgba(232,185,79,0.7);"></div>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <div style={{ position: "relative", height: "100dvh", overflow: "hidden" }}>
      {/* Real Leaflet Map */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <style>{`
          .leaflet-container { background: #1A1916 !important; }
          .leaflet-tile { filter: brightness(0.6) saturate(0.5) sepia(30%); }
          @keyframes fw-pulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.6);opacity:0.1} }
          .leaflet-control-attribution { display: none !important; }
          .leaflet-control-zoom { display: none !important; }
        `}</style>
        {!loading && (
          <MapContainer
            center={[coords.lat, coords.lon]}
            zoom={13}
            style={{ width: "100%", height: "100%" }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapFlyTo lat={coords.lat} lon={coords.lon} />

            {/* User Location Marker */}
            <Marker position={[coords.lat, coords.lon]} icon={userIcon}>
              <Popup>
                <div style={{ background: "#1A1916", color: "#F5EDD8", padding: "8px", borderRadius: "8px", fontSize: "12px" }}>
                  📍 <strong>{user.location}</strong><br />Your current position
                </div>
              </Popup>
            </Marker>

            {/* Safety radius overlay */}
            <Circle
              center={[coords.lat, coords.lon]}
              radius={800}
              color={activeLayer === "temp" ? "#E8B94F" : activeLayer === "aqi" ? "#D96B4E" : activeLayer === "humidity" ? "#6EA8D9" : "#7DBF72"}
              fillColor={activeLayer === "temp" ? "#E8B94F" : activeLayer === "aqi" ? "#D96B4E" : activeLayer === "humidity" ? "#6EA8D9" : "#7DBF72"}
              fillOpacity={0.06}
              weight={1}
              opacity={0.3}
            />

            {/* Nearby spots markers */}
            {nearbyPlaces.map((place) => (
              <Marker
                key={place.name}
                position={[place.lat, place.lon]}
                icon={customIcon(statusColors[place.status as keyof typeof statusColors])}
                eventHandlers={{
                  click: () => setSelectedPlace(place.name),
                }}
              >
                <Popup>
                  <div style={{ minWidth: "140px", fontSize: "12px" }}>
                    <strong>{place.name}</strong><br />
                    <span style={{ color: statusColors[place.status as keyof typeof statusColors] }}>
                      Score: {place.score}
                    </span><br />
                    {place.type}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {loading && (
          <div className="flex items-center justify-center h-full bg-[#1A1916]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-[#E8B94F] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#9A9080] text-sm">Loading map data...</p>
            </div>
          </div>
        )}

        {/* Layer color overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 400,
          background: activeLayer === "temp"
            ? "radial-gradient(ellipse at 50% 40%, rgba(232,185,79,0.10) 0%, transparent 70%)"
            : activeLayer === "aqi"
            ? "radial-gradient(ellipse at 50% 40%, rgba(217,107,78,0.10) 0%, transparent 70%)"
            : activeLayer === "humidity"
            ? "radial-gradient(ellipse at 50% 40%, rgba(110,168,217,0.10) 0%, transparent 70%)"
            : "radial-gradient(ellipse at 50% 40%, rgba(125,191,114,0.10) 0%, transparent 70%)",
          transition: "background 500ms ease",
        }} />
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ position: "absolute", top: "20px", left: "16px", right: "70px", zIndex: 500 }}
      >
        <div style={{
          background: "rgba(26,25,22,0.90)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,248,235,0.12)", borderRadius: "999px",
          padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px",
        }}>
          <Search size={16} color="#9A9080" />
          <input
            placeholder="Search location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "transparent", border: "none", outline: "none",
              fontSize: "14px", color: "#F5EDD8", flex: 1,
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: "#9A9080", background: "none", border: "none", cursor: "pointer" }}>✕</button>
          )}
        </div>
      </motion.div>

      {/* Layer Toggle Buttons */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          position: "absolute", top: "16px", right: "16px", zIndex: 500,
          display: "flex", flexDirection: "column", gap: "6px",
        }}
      >
        {layers.map((layer) => {
          const Icon = layer.icon;
          const isActive = activeLayer === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              title={layer.label}
              style={{
                width: "42px", height: "42px", borderRadius: "12px",
                background: isActive ? `${layer.color}20` : "rgba(26,25,22,0.90)",
                backdropFilter: "blur(12px)",
                border: isActive ? `1px solid ${layer.color}60` : "1px solid rgba(255,248,235,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 200ms ease",
              }}
            >
              <Icon size={18} color={isActive ? layer.color : "#9A9080"} />
            </button>
          );
        })}
        {/* My Location button */}
        <button
          title="My Location"
          style={{
            width: "42px", height: "42px", borderRadius: "12px", marginTop: "4px",
            background: "rgba(232,185,79,0.12)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(232,185,79,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Navigation size={18} color="#E8B94F" />
        </button>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ position: "absolute", bottom: "230px", left: "16px", zIndex: 500 }}
      >
        <div style={{
          background: "rgba(26,25,22,0.90)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,248,235,0.1)", borderRadius: "12px", padding: "10px 12px",
        }}>
          <p style={{ fontSize: "10px", color: "#9A9080", marginBottom: "6px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {layers.find((l) => l.id === activeLayer)?.label}
          </p>
          <div className="flex items-center gap-1">
            {legendColors.map((l, i) => (
              <div key={i} style={{ width: "16px", height: "8px", borderRadius: "4px", background: l.color }} />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span style={{ fontSize: "9px", color: "#5C5548" }}>Safe</span>
            <span style={{ fontSize: "9px", color: "#5C5548" }}>Danger</span>
          </div>
        </div>
      </motion.div>

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute bottom-[88px] md:bottom-8 left-0 right-0 z-[500] px-4 md:w-[420px] md:right-auto md:left-4"
      >
        <div style={{
          background: "rgba(26,25,22,0.95)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,248,235,0.1)", borderRadius: "20px", padding: "16px",
        }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
            <p style={{ fontSize: "11px", color: "#9A9080", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              NEARBY LOCATIONS
            </p>
            <div className="flex items-center gap-1">
              <div style={{ width: "6px", height: "6px", borderRadius: "99px", background: "#7DBF72" }} />
              <span style={{ fontSize: "10px", color: "#5C5548", fontWeight: 600 }}>LIVE</span>
            </div>
          </div>

          <div
            className="fw-scroll flex gap-3 overflow-x-auto md:flex-col md:overflow-y-auto"
            style={{ paddingBottom: "4px", maxHeight: "38vh" }}
          >
            {nearbyPlaces.map((place) => (
              <div
                key={place.name}
                onClick={() => setSelectedPlace(place.name === selectedPlace ? null : place.name)}
                style={{
                  flexShrink: 0,
                  width: "160px",
                  background: selectedPlace === place.name ? "rgba(232,185,79,0.08)" : "#222119",
                  border: `1px solid ${selectedPlace === place.name ? "rgba(232,185,79,0.3)" : "rgba(255,248,235,0.08)"}`,
                  borderRadius: "14px", padding: "12px", cursor: "pointer",
                  transition: "all 200ms ease",
                }}
                className="md:w-full"
              >
                <div className="flex items-center justify-between mb-2">
                  <MapPin size={12} color="#9A9080" />
                  <div style={{
                    background: `${statusColors[place.status as keyof typeof statusColors]}18`,
                    border: `1px solid ${statusColors[place.status as keyof typeof statusColors]}40`,
                    borderRadius: "999px", padding: "2px 8px",
                  }}>
                    <span className="fw-mono" style={{
                      fontSize: "11px", fontWeight: 700,
                      color: statusColors[place.status as keyof typeof statusColors],
                    }}>
                      {place.score}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#F5EDD8", marginBottom: "2px" }}>{place.name}</p>
                <p style={{ fontSize: "11px", color: "#9A9080", marginBottom: "8px" }}>{place.type}</p>
                <div className="flex gap-2">
                  <span style={{ fontSize: "10px", color: "#5C5548" }}>🌡 {place.temp}</span>
                  <span style={{ fontSize: "10px", color: "#5C5548" }}>☀️ {place.aqi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
