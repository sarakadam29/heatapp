import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine,
} from "recharts";
import { ArrowLeft, Bell, Bookmark, Thermometer, Sun, Droplets, Wind, User, Heart } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { toast } from "sonner";
import { format } from "date-fns";

const tempData = [
  { time: "6am", temp: 26, heat: 28 },
  { time: "7am", temp: 28, heat: 30 },
  { time: "8am", temp: 30, heat: 33 },
  { time: "9am", temp: 32, heat: 36 },
  { time: "10am", temp: 34, heat: 38 },
  { time: "11am", temp: 36, heat: 41 },
  { time: "12pm", temp: 38, heat: 44 },
  { time: "1pm", temp: 39, heat: 46 },
  { time: "2pm", temp: 40, heat: 47 },
  { time: "3pm", temp: 39, heat: 45 },
  { time: "4pm", temp: 37, heat: 42 },
  { time: "5pm", temp: 34, heat: 38 },
  { time: "6pm", temp: 31, heat: 34 },
  { time: "7pm", temp: 29, heat: 31 },
  { time: "8pm", temp: 27, heat: 29 },
  { time: "9pm", temp: 26, heat: 27 },
];

const riskColors: Record<string, string> = {
  low: "#7DBF72",
  moderate: "#E8B94F",
  high: "#D96B4E",
};

const riskLabels: Record<string, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

const verdictConfig = {
  safe: { label: "✅ SAFE TO GO", color: "#7DBF72", bg: "rgba(125,191,114,0.12)" },
  caution: { label: "⚠️ PROCEED WITH CAUTION", color: "#E8B94F", bg: "rgba(232,185,79,0.12)" },
  danger: { label: "🚫 NOT RECOMMENDED", color: "#D96B4E", bg: "rgba(217,107,78,0.12)" },
};

function SafetyRing({ score, verdict }: { score: number; verdict: string }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [dashOffset, setDashOffset] = useState(440);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeColor = verdict === "safe" ? "#7DBF72" : verdict === "caution" ? "#E8B94F" : "#D96B4E";

  useEffect(() => {
    const timer = setTimeout(() => {
      const targetOffset = circumference - (score / 100) * circumference;
      setDashOffset(targetOffset);

      let current = 0;
      const increment = score / 60;
      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          current = score;
          clearInterval(interval);
        }
        setAnimatedScore(Math.round(current));
      }, 13);
      return () => clearInterval(interval);
    }, 200);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  return (
    <div className="flex flex-col items-center" style={{ padding: "24px 0" }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#2A2620"
          strokeWidth="10"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transformOrigin: "center",
            transform: "rotate(-90deg)",
            transition: "stroke-dashoffset 900ms cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        <text
          x="90"
          y="82"
          textAnchor="middle"
          fill="#F5EDD8"
          fontSize="42"
          fontWeight="800"
          fontFamily="'JetBrains Mono', monospace"
        >
          {animatedScore}
        </text>
        <text
          x="90"
          y="104"
          textAnchor="middle"
          fill="#9A9080"
          fontSize="12"
          fontFamily="'DM Sans', sans-serif"
        >
          Safety Score
        </text>
      </svg>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#1A1916",
          border: "1px solid rgba(255,248,235,0.1)",
          borderRadius: "10px",
          padding: "8px 12px",
        }}
      >
        <p style={{ fontSize: "11px", color: "#9A9080", marginBottom: "3px" }}>{label}</p>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "#E8B94F" }}>
          {payload[0].value}°C
        </p>
      </div>
    );
  }
  return null;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function PredictPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, addToHistory, weather, loading, getRisk } = useAppContext();
  
  const state = (location.state as { activity?: string; time?: string }) || {};
  const activityLabel = state.activity ? (state.activity.charAt(0).toUpperCase() + state.activity.slice(1)) : "Running";
  const timeLabel = state.time || "7:00 AM";

  // Calculate risk using the decision tree engine
  const riskResult = useMemo(() => getRisk(state.activity || "run", timeLabel), [getRisk, state.activity, timeLabel]);
  
  if (!riskResult || !weather) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111110]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#E8B94F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#9A9080] text-sm">Analyzing thermal patterns...</p>
        </div>
      </div>
    );
  }

  const { score: SCORE, verdict: VERDICT, factors, recommendation } = riskResult;
  const vc = verdictConfig[VERDICT];

  // Map weather data for charts
  const chartData = useMemo(() => {
    return weather.hourly.time.slice(5, 22).map((t, i) => {
      const idx = i + 5;
      const d = new Date(t);
      return {
        time: d.getHours() > 12 ? `${d.getHours() - 12}pm` : `${d.getHours()}am`,
        temp: Math.round(weather.hourly.temperature_2m[idx]),
        heat: Math.round(weather.hourly.apparent_temperature[idx]),
      };
    });
  }, [weather]);

  const onSaveHistory = () => {
    addToHistory({
      type: state.activity || "run",
      label: `${activityLabel} Session`,
      date: format(new Date(), "EEE, MMM d"),
      time: timeLabel,
      score: SCORE,
      status: VERDICT,
      temp: `${Math.round(weather.hourly.temperature_2m[0])}°C`, // Simplified
      uv: `${Math.round(weather.hourly.uv_index[0])}`,
      aqi: "Live",
      duration: "30 min",
      emoji: state.activity === "walk" ? "🚶" : state.activity === "cycle" ? "🚴" : "🏃"
    });
    toast.success("Added to your activity history!");
    navigate("/history");
  };

  const onSetReminder = () => {
    toast.success(`Reminder set for your ${activityLabel} at ${timeLabel}`);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: "0 16px 24px" }}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
        style={{ padding: "20px 4px 16px" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="hover:bg-white/10 transition-colors"
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
          }}
        >
          <ArrowLeft size={18} color="#F5EDD8" />
        </button>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#F5EDD8",
          }}
        >
          Activity Analysis
        </h2>
        <div style={{ width: "38px" }} />
      </motion.div>

      {/* Activity summary pill */}
      <motion.div variants={itemVariants} className="flex justify-center" style={{ marginBottom: "4px" }}>
        <div
          style={{
            background: "rgba(232,185,79,0.1)",
            border: "1px solid rgba(232,185,79,0.25)",
            borderRadius: "999px",
            padding: "8px 20px",
            display: "inline-flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "16px" }}>
            {state.activity === "walk" ? "🚶" : state.activity === "cycle" ? "🚴" : "🏃"}
          </span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#E8B94F" }}>
            {activityLabel} · {timeLabel}
          </span>
        </div>
      </motion.div>

      {/* Safety Ring */}
      <motion.div variants={itemVariants}>
        <SafetyRing score={SCORE} verdict={VERDICT} />
      </motion.div>

      {/* Verdict Badge */}
      <motion.div
        variants={itemVariants}
        className="fw-verdict-pulse flex justify-center"
        style={{ marginBottom: "20px" }}
      >
        <div
          style={{
            background: vc.bg,
            border: `1px solid ${vc.color}40`,
            borderRadius: "999px",
            padding: "10px 24px",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 700, color: vc.color, letterSpacing: "-0.01em" }}>
            {vc.label}
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column: Risk Factors & AI */}
        <div className="flex flex-col gap-6">
          {/* Risk Factors */}
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
              RISK FACTORS
            </p>
            <div className="flex flex-col gap-2">
              {factors.map((factor: any, i: number) => (
                <motion.div
                  key={factor.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.3 }}
                  className="fw-card"
                  style={{ padding: "14px 16px" }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "10px",
                        background: `${riskColors[factor.risk]}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: riskColors[factor.risk],
                        flexShrink: 0,
                      }}
                    >
                      {factor.name === "Temperature" || factor.name === "Heat Index" ? <Thermometer size={18} /> : 
                       factor.name === "UV Index" ? <Sun size={18} /> :
                       factor.name === "Humidity" ? <Droplets size={18} /> :
                       factor.name === "Age Factor" ? <User size={18} /> :
                       <Heart size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#F5EDD8" }}>{factor.name}</p>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: "12px", color: "#9A9080" }}>{factor.value}</span>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              color: riskColors[factor.risk],
                              background: `${riskColors[factor.risk]}18`,
                              padding: "2px 8px",
                              borderRadius: "999px",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {riskLabels[factor.risk]}
                          </span>
                        </div>
                      </div>
                      <div className="fw-risk-track">
                        <div
                          className="fw-risk-fill"
                          style={{
                            width: `${factor.pct}%`,
                            background: riskColors[factor.risk],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Recommendation */}
          <motion.div variants={itemVariants} className="fw-card" style={{ padding: "20px" }}>
            <div className="flex items-center gap-2 mb-10px">
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "rgba(232,185,79,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                }}
              >
                🤖
              </div>
              <p
                style={{
                  fontSize: "11px",
                  color: "#9A9080",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                AI RECOMMENDATION
              </p>
            </div>
            <p style={{ fontSize: "14px", color: "#F5EDD8", lineHeight: 1.65, marginTop: "12px" }}>
              {recommendation}
            </p>
          </motion.div>
        </div>

        {/* Right Column: Charts */}
        <div className="flex flex-col gap-6">
          {/* Temperature Timeline Chart */}
          <motion.div variants={itemVariants} className="fw-card" style={{ padding: "20px" }}>
            <p
              style={{
                fontSize: "11px",
                color: "#9A9080",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              TEMPERATURE TIMELINE
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,248,235,0.05)" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#5C5548", fontFamily: "'DM Sans'" }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#5C5548", fontFamily: "'DM Sans'" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x="7am" stroke="rgba(232,185,79,0.4)" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#E8B94F"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#E8B94F", strokeWidth: 0 }}
                  animationBegin={0}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Heat Index Chart */}
          <motion.div variants={itemVariants} className="fw-card" style={{ padding: "20px" }}>
            <p
              style={{
                fontSize: "11px",
                color: "#9A9080",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              HEAT INDEX
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="heatGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8B94F" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E8B94F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,248,235,0.05)" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#5C5548", fontFamily: "'DM Sans'" }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#5C5548", fontFamily: "'DM Sans'" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="heat"
                  stroke="#E8B94F"
                  strokeWidth={2}
                  fill="url(#heatGradient)"
                  animationBegin={0}
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <button 
          onClick={onSetReminder}
          className="fw-btn-ghost flex-1 flex items-center justify-center gap-2 hover:bg-white/5"
        >
          <Bell size={16} />
          Set Reminder
        </button>
        <button
          className="fw-btn-primary flex-1 flex items-center justify-center gap-2 group"
          onClick={onSaveHistory}
        >
          <Bookmark size={16} className="group-hover:scale-110 transition-transform" />
          Save to History
        </button>
      </motion.div>
    </motion.div>
  );
}