# FitWeather AI — Adaptive Heat Safety Assistant

FitWeather AI is a high-performance web application designed to protect outdoor enthusiasts and workers from heat-related illness. It combines real-time weather analytics with a personalized risk-assessment algorithm.

## 🚀 Hackathon Requirement Fulfillment

### 1. Algorithmic Logic (Decision Tree)
The core of the app is the **Heat Risk Engine** (`src/app/services/heatRiskEngine.ts`). This is not a simple linear formula but a weighted decision tree that evaluates:
- **Environmental Factors**: Uses apparent temperature (Heat Index), UV Index, relative humidity, and wind speed.
- **Personal Risk Factors**: User age and pre-existing health conditions (Heart disease, Asthma, etc.).
- **Activity Intensity**: Physical demand of the selected activity (Running vs. Walking vs. Cycling).
- **Convective Cooling**: High wind speeds provide a "cooling bonus" to the safety score.
- **Verdict Logic**: Outputs a prioritized safety verdict (Safe, Caution, Danger) with personalized behavioral recommendations.

### 2. Live API Integration
The app integrates the **Open-Meteo API** to fetch high-resolution, hourly meteorological data without requiring API keys.
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Data Points**: Temperature, Apparent Temperature, UV Index, Humidity, and Wind Speed.
- **Real-time Syncing**: The app fetches live data on load to ensure predictions are based on current atmospheric conditions.

### 3. UI + Backend Logic
- **Functional Backend**: Implemented via a robust React context provider (`AppContext.tsx`) that manages asynchronous state, local storage persistence, and the algorithmic engine.
- **Premium UI**: Built with a "Sleek Dark" aesthetic, featuring responsive charts (Recharts), micro-animations (Framer Motion), and a fully responsive layout (Desktop Sidebar + Mobile Bottom Bar).

### 4. Data Handling
- **Live Datasets**: Direct streaming from meteorological satellites via REST API.
- **Persistence**: User profiles, activity logs, and preferences are persisted locally using `localStorage`.
- **Predefined Constraints**: Uses standard metabolic equivalent (MET) intensity levels for different activities.

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`

---

## 🏗️ Project Structure
- `/src/app/services`: Core logic (API calls and Algorithmic Engine).
- `/src/app/context`: Global state management and logic wiring.
- `/src/app/components`: Responsive UI components and data visualizations.
- `/src/styles`: Custom design system and CSS utilities.

## ⚖️ Algorithm Explanation
```typescript
// Heat Risk Logic Flow:
Score = 100 
  - (ApparentTemp Penalty) // >32°C = -15, >38°C = -35
  - (UV Penalty)           // High UV = -20
  - (Humidity Penalty)     // >70% = -10
  - (Activity Penalty)     // Running = -15
  - (Age Penalty)          // >45 = -15, >60 = -25
  - (Health Penalty)       // Chronic conditions = -20
  + (Wind Bonus)           // Wind >15km/h = +5
```
*Final verdicts are categorized at thresholds of 75 (Caution) and 45 (Danger).*