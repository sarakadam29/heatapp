import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { format } from "date-fns";
import { useAppContext } from "../context/AppContext";
import {
  MapPin,
  Bell,
  Wind,
  Sun,
  Droplets,
  Thermometer,
  ArrowRight,
} from "lucide-react";

const activities = [
  { id: "walk", label: "Walk", icon: "🚶", emoji: true },
  { id: "run", label: "Run", icon: "🏃", emoji: true },
  { id: "cycle", label: "Cycle", icon: "🚴", emoji: true },
];

const timeSlots = [
  "5am", "6am", "7am", "8am", "9am", "10am", "11am", "12pm",
  "1pm", "2pm", "3pm", "4pm", "5pm", "6pm",
];

const optimalWindows = [
  { time: "6:00 – 8:00 AM", status: "safe", label: "Safe", score: 88 },
  { time: "8:00 – 10:00 AM", status: "caution", label: "Caution", score: 62 },
  { time: "12:00 – 3:00 PM", status: "danger", label: "Avoid", score: 28 },
  { time: "5:00 – 7:00 PM", status: "safe", label: "Safe", score: 79 },
];

const statusColors = {
  safe: "#7DBF72",
  caution: "#E8B94F",
  danger: "#D96B4E",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function HomePage() {
  const navigate = useNavigate();
  const { user, weather, loading, getRisk } = useAppContext();
  const [selectedActivity, setSelectedActivity] = useState(user.defaultActivity.toLowerCase());
  const [selectedTime, setSelectedTime] = useState("7am");

  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  
  // Get current metrics from weather data
  const currentMetrics = useMemo(() => {
    if (!weather) return { temp: "--", uv: "--", hum: "--", wind: "--" };
    const h = weather.hourly;
    return {
      temp: Math.round(h.temperature_2m[currentHour]),
      uv: Math.round(h.uv_index[currentHour]),
      hum: h.relative_humidity_2m[currentHour],
      wind: Math.round(h.wind_speed_10m[currentHour]),
    };
  }, [weather, currentHour]);

  // Compute optimal windows using the algorithm
  const memoWindows = useMemo(() => {
    if (!weather) return [];
    const times = ["7am", "10am", "1pm", "6pm"];
    return times.map(t => {
      const risk = getRisk(selectedActivity, t);
      return {
        time: t === "7am" ? "6:00 – 8:00 AM" : t === "10am" ? "9:00 – 11:00 AM" : t === "1pm" ? "12:00 – 3:00 PM" : "5:00 – 8:00 PM",
        status: risk?.verdict || "safe",
        label: (risk ? (risk.verdict.charAt(0).toUpperCase() + risk.verdict.slice(1)) : "Safe"),
        score: risk?.score || 100
      };
    });
  }, [weather, selectedActivity, getRisk]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111110]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#E8B94F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#9A9080] text-sm animate-pulse">Syncing with satellites...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: "0 16px 16px" }}
    >
      {/* Top Bar */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
        style={{ padding: "20px 4px 16px" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "999px",
              background: "rgba(232,185,79,0.18)",
            }}
          >
            <MapPin size={16} color="#E8B94F" strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize: "11px", color: "#9A9080", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              CURRENT LOCATION
            </p>
            <p style={{ fontSize: "14px", color: "#F5EDD8", fontWeight: 600 }}>
              {user.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="hover:scale-105 transition-transform"
            style={{
              background: "rgba(255,248,235,0.06)",
              border: "1px solid rgba(255,248,235,0.1)",
              borderRadius: "999px",
              width: "38px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Bell size={16} color="#9A9080" />
            <span
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "6px",
                height: "6px",
                borderRadius: "999px",
                background: "#E8B94F",
              }}
            />
          </button>
          <div
            onClick={() => navigate("/profile")}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #E8B94F, #C49A30)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              fontWeight: 700,
              color: "#111110",
              cursor: "pointer"
            }}
          >
            {user.name.charAt(0)}
          </div>
        </div>
      </motion.div>

      {/* Wordmark */}
      <motion.div variants={itemVariants} style={{ marginBottom: "16px", padding: "0 4px" }}>
        <h1
          className="fw-display"
          style={{
            fontSize: "clamp(22px, 5vw, 28px)",
            background: "linear-gradient(135deg, #E8B94F, #F5EDD8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "2px",
          }}
        >
          FitWeather AI
        </h1>
        <p style={{ fontSize: "13px", color: "#9A9080" }}>
          {format(currentDate, "EEEE, MMMM d, yyyy")}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hero & Planner */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-4 lg:gap-6">
          {/* Hero Weather Card */}
          <motion.div
            variants={itemVariants}
            className="fw-card overflow-hidden group w-full"
            style={{
              padding: "24px",
              background: "linear-gradient(145deg, #1E1C18 0%, #222119 100%)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-30px",
                right: "-30px",
                width: "150px",
                height: "150px",
                borderRadius: "999px",
                background: "radial-gradient(circle, rgba(232,185,79,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div className="flex items-start justify-between">
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#9A9080",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}
                >
                  RIGHT NOW
                </p>
                <div
                  className="fw-display fw-mono"
                  style={{
                    fontSize: "clamp(52px, 10vw, 72px)",
                    color: "#F5EDD8",
                    lineHeight: 1,
                    marginBottom: "6px",
                  }}
                >
                  {currentMetrics.temp}°C
                </div>
                <p style={{ fontSize: "16px", color: "#E8B94F", fontWeight: 600 }}>
                  Live Data
                </p>
                <p style={{ fontSize: "13px", color: "#9A9080", marginTop: "2px" }}>
                  {user.location} · Feels like 36°C
                </p>
              </div>
              <div style={{ fontSize: "clamp(52px, 8vw, 64px)", lineHeight: 1 }}>⛅</div>
            </div>

            {/* Data pills row */}
            <div className="flex gap-2 mt-6">
              {[
                { icon: <Thermometer size={14} />, value: `${currentMetrics.temp}°C`, label: "Temp" },
                { icon: <Wind size={14} />, value: `${currentMetrics.wind} km/h`, label: "Wind" },
                { icon: <Sun size={14} />, value: `UV ${currentMetrics.uv}`, label: "Index" },
              ].map((pill) => (
                <div
                  key={pill.label}
                  className="fw-data-pill flex-1 text-center"
                  style={{ padding: "10px 8px" }}
                >
                  <div style={{ color: "#9A9080", display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                    {pill.icon}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#F5EDD8" }}>{pill.value}</div>
                  <div style={{ fontSize: "10px", color: "#9A9080", marginTop: "2px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {pill.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Planner Strip */}
          <motion.div variants={itemVariants}>
            <p
              style={{
                fontSize: "11px",
                color: "#9A9080",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "10px",
                padding: "0 4px",
              }}
            >
              PLAN YOUR ACTIVITY
            </p>
            <div className="flex gap-3">
              {activities.map((act) => (
                <button
                  key={act.id}
                  onClick={() => setSelectedActivity(act.id)}
                  className="flex-1 fw-card flex flex-col items-center gap-2 hover:bg-[#201e1a] transition-all"
                  style={{
                    padding: "16px 8px",
                    border: selectedActivity === act.id
                      ? "1.5px solid #E8B94F"
                      : "1px solid rgba(255,248,235,0.08)",
                    cursor: "pointer",
                    background: selectedActivity === act.id
                      ? "rgba(232,185,79,0.08)"
                      : "#1A1916",
                  }}
                >
                  <span className="text-[26px] group-hover:scale-110 transition-transform">{act.icon}</span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: selectedActivity === act.id ? "#E8B94F" : "#9A9080",
                    }}
                  >
                    {act.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Time Picker Row */}
          <motion.div variants={itemVariants}>
            <div className="flex justify-between items-end mb-[10px] px-[4px]">
              <p
                style={{
                  fontSize: "11px",
                  color: "#9A9080",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                SELECT TIME
              </p>
              <p style={{ fontSize: "11px", color: "#5C5548" }}>Currently: {format(currentDate, "h:mm a")}</p>
            </div>
            <div
              className="fw-scroll flex gap-2 overflow-x-auto pb-1"
            >
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  style={{
                    flexShrink: 0,
                    padding: "10px 18px",
                    borderRadius: "999px",
                    border: "1px solid",
                    borderColor: selectedTime === slot ? "#E8B94F" : "rgba(255,248,235,0.1)",
                    background: selectedTime === slot ? "#E8B94F" : "rgba(255,248,235,0.04)",
                    color: selectedTime === slot ? "#111110" : "#9A9080",
                    fontSize: "14px",
                    fontWeight: selectedTime === slot ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 200ms ease",
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Check Safety CTA */}
          <motion.div variants={itemVariants} className="mt-2 text-center lg:text-left">
            <button
              className="fw-btn-primary w-full lg:w-auto flex items-center justify-center gap-2 group mx-auto lg:mx-0"
              onClick={() => navigate("/predict", { state: { activity: selectedActivity, time: selectedTime } })}
            >
              <span className="text-[16px] px-4">Check Safety Now</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Right Column: Windows & Stats */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-4 lg:gap-6 mt-4 lg:mt-0">
          {/* Today's Optimal Windows */}
          <motion.div variants={itemVariants} className="fw-card transition-all hover:border-[#E8B94F40] h-full flex flex-col" style={{ padding: "24px" }}>
            <p
              style={{
                fontSize: "11px",
                color: "#9A9080",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              TODAY'S OPTIMAL WINDOWS
            </p>
            <div className="flex flex-col gap-5 flex-1 justify-center">
              {memoWindows.map((w, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div style={{ width: "100px", flexShrink: 0 }}>
                    <p style={{ fontSize: "12px", color: "#9A9080" }}>{w.time}</p>
                  </div>
                  <div className="fw-risk-track flex-1 h-[8px]">
                    <div
                      className="fw-risk-fill h-[8px]"
                      style={{
                        width: `${w.score}%`,
                        background: statusColors[w.status as keyof typeof statusColors],
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: statusColors[w.status as keyof typeof statusColors],
                      width: "55px",
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {w.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="flex gap-3">
            {[
              { icon: <Wind size={18} />, value: `${currentMetrics.wind}kmh`, label: "Wind", unit: "Outdoor" },
              { icon: <Droplets size={18} />, value: `${currentMetrics.hum}%`, label: "Humidity", unit: "Relative" },
              { icon: <Thermometer size={18} />, value: `${currentMetrics.temp}°C`, label: "Actual", unit: "Ambient" },
            ].map((stat: any) => (
              <div
                key={stat.label}
                className="fw-data-pill flex-1 text-center py-4"
              >
                <div style={{ color: "#E8B94F", display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#F5EDD8" }}>{stat.value}</div>
                <div style={{ fontSize: "11px", color: "#9A9080", marginTop: "4px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: "11px", color: "#5C5548", marginTop: "2px" }}>{stat.unit}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
