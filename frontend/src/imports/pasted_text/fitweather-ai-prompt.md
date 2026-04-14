# 🌤️ STITCH PRODUCTION PROMPT — **HeatGuard**
### *Outdoor Activity Safety Intelligence Platform*

---

## a. PROJECT OVERVIEW

**HeatGuard** is a web application that uses machine learning to predict whether environmental and personal health conditions make it safe and optimal to perform outdoor physical activity at a chosen time. Users build a personal health profile (age, medical conditions, fitness level, demographic data), then input their planned activity (walking, running, cycling), date/time window, and location. The ML engine returns a Safety Score (0–100), a Go / Caution / Avoid verdict, and detailed reasoning cards breaking down each risk factor. The app visualizes heat index trends, UV exposure, humidity, air quality, and temperature over time via interactive charts. Additional features: 7-day Optimal Windows Planner, Activity History Log, Personalized Hydration & Rest Reminders, Health Risk Heatmap Overlay, Community Check-ins, Weekly Fitness-Weather Report, and Wearable Device Sync Dashboard.

---

## b. VISUAL LANGUAGE *(extracted exclusively from WanderWeather reference video)*

**Aesthetic Mood:** Dark organic warmth — earthy deep charcoal/near-black backgrounds with warm amber and golden-hour tone accents. NOT cold blue tech. Feels like premium travel + nature intelligence. Soft, rounded components floating on dark surfaces. Ultra-heavyweight display typography. Documentary / editorial feel.

**Color Palette:**
```
--bg-base:           #111110   /* deepest charcoal-black */
--bg-surface:        #1A1916   /* card surface, warm dark brown-black */
--bg-elevated:       #222119   /* elevated panel, slightly lighter */
--glass-fill:        rgba(255, 248, 235, 0.05)
--glass-border:      rgba(255, 248, 235, 0.09)
--accent-gold:       #E8B94F   /* primary CTA, active nav, highlights */
--accent-gold-muted: #C49A30
--accent-warm-white: #F5EDD8   /* primary text */
--text-secondary:    #9A9080   /* subtext, metadata */
--text-tertiary:     #5C5548   /* disabled, placeholders */
--status-safe:       #7DBF72   /* go / safe verdict */
--status-caution:    #E8B94F   /* caution verdict (reuse gold) */
--status-danger:     #D96B4E   /* avoid / danger verdict */
--map-bg:            #2A2620   /* sepia-toned map surface */
--tag-bg:            rgba(232, 185, 79, 0.12)
--tag-border:        rgba(232, 185, 79, 0.25)
```

**Typography:**
```
Display font:   "Neue Haas Grotesk" or "Aktiv Grotesk" — ultra-bold (900), very large scale, tight letter-spacing (-0.03em)
Body font:      "DM Sans" or "Instrument Sans" — regular/medium weights
Mono font:      "JetBrains Mono" — for data readouts, scores, numbers

Scale:
  --text-display:  clamp(48px, 8vw, 96px) — hero numbers, scores
  --text-h1:       32px / font-weight: 800
  --text-h2:       22px / font-weight: 700
  --text-h3:       16px / font-weight: 600
  --text-body:     14px / font-weight: 400
  --text-caption:  12px / font-weight: 400
  --text-label:    11px / font-weight: 500 / letter-spacing: 0.08em / uppercase
```

**Spacing System:**
```
--space-xs:   4px
--space-sm:   8px
--space-md:   16px
--space-lg:   24px
--space-xl:   32px
--space-2xl:  48px
--space-3xl:  64px
Border radius: --radius-sm: 10px / --radius-md: 16px / --radius-lg: 24px / --radius-pill: 999px
```

**Component Style:**
- Cards: dark `#1A1916` background, `1px solid rgba(255,248,235,0.08)` border, `border-radius: 20px`, subtle `box-shadow: 0 4px 32px rgba(0,0,0,0.4)`
- Buttons (primary): `background: #E8B94F`, `color: #111110`, bold 600 weight, `border-radius: 999px`, padding `12px 28px`
- Buttons (ghost): `border: 1px solid rgba(255,248,235,0.15)`, `color: #F5EDD8`, transparent fill
- Bottom nav: dark pill `#1E1C18`, 5 icons, active icon inside gold filled circle
- Tags/chips: dark amber-tinted background, rounded pill shape, small label text
- Weather data pills: dark surface cards with icon + value + label stack
- Horizontal date/week strip: scrollable row, selected date in white circle
- Map: sepia/dark-toned cartographic style with colored overlays and floating info cards
- Image headers: full-bleed photo top of detail cards, gradient fade to dark card content below

**Motion & Interaction:**
- Fade-in stagger on page load (50ms increments per card)
- Score counter animates up from 0 on result reveal
- Smooth tab switching with sliding underline indicator
- Cards have `transform: translateY(-2px)` hover lift
- Chart lines draw in from left on appear
- Bottom nav icon scales 1.1 on active state
- Verdict badge pulses once on appear (single keyframe pulse)

---

## c. PAGE-BY-PAGE UI PLAN

---

### PAGE 1 — HOME / DASHBOARD
**Layout:** Single scroll column, mobile-first centered (max-width 420px on web, centered)

**Sections:**
1. **Top Bar** — Avatar circle (right), Location pin + city name (left), notification bell icon
2. **Hero Weather Card** — Full-width card, large temperature display (`--text-display`), condition label ("It's Foggy"), 3 inline data pills: Real Feel · Wind · UV Index
3. **Activity Planner Strip** — Section label "Plan Your Activity", 3 icon-button cards: 🚶 Walk / 🏃 Run / 🚴 Cycle — horizontally scrollable, selected state gets gold border
4. **Time Picker Row** — Horizontal time slot chips: 6am, 7am, 8am... current time highlighted gold
5. **Quick Predict CTA** — Large pill button "Check Safety Now →" in gold
6. **Today's Optimal Windows** — Card with 3–4 time windows shown as colored bars (green=safe, amber=caution, red=avoid) with time labels
7. **Stats Row** — 3 mini cards: AQI · Humidity · Feels Like
8. **Bottom Nav** — 5 tabs: Home · Predict · Map · History · Profile

---

### PAGE 2 — PREDICT / ML RESULT SCREEN
**Layout:** Scrollable detail page, entered after tapping "Check Safety Now"

**Sections:**
1. **Back nav** + page title "Activity Analysis"
2. **Activity + Time Summary** — Pill showing selected: "🏃 Running · 7:00 AM"
3. **Safety Score Donut** — Large circular progress ring, score 0–100 in center in mono font, color reflects severity, animated draw-in
4. **Verdict Badge** — Centered pill: "✅ SAFE TO GO" / "⚠️ PROCEED WITH CAUTION" / "🚫 NOT RECOMMENDED" — color-coded
5. **Risk Factor Cards** — Vertical stack of 4–6 cards, each showing: icon · factor name · value · risk level bar:
   - 🌡️ Temperature · 38°C · High
   - ☀️ UV Index · 9 · Very High
   - 💧 Humidity · 82% · Moderate
   - 💨 Air Quality · 145 AQI · Unhealthy
   - 👤 Age Risk · 65yrs · Elevated
   - 🫀 Health Flag · Hypertension · High
6. **Temperature Timeline Chart** — Line chart, hourly, 6am–9pm, with current time marker, smooth curve, warm amber line on dark surface
7. **Heat Index Chart** — Area chart below, filled amber-to-dark gradient
8. **AI Recommendation Text** — Card with light text, personalized reasoning paragraph generated by model
9. **Action Buttons** — "Set Reminder" (ghost) + "Save to History" (gold)

---

### PAGE 3 — MAP / HEATMAP VIEW
**Layout:** Full-screen map with floating overlay cards

**Sections:**
1. **Map Fill** — Full viewport, sepia/dark cartographic style, colored temperature/AQI overlay layer
2. **Top Search Bar** — Pill-shaped, frosted dark, "Search location..."
3. **Layer Toggle Buttons** — Right rail vertical icon strip: Wind · Temperature · Humidity · AQI (matches WanderWeather layer icons)
4. **Current Location Beacon** — Gold pulsing dot with avatar
5. **Floating Nearby Card Strip** — Bottom sheet, scrollable cards: nearby parks/routes with safety score badge on each
6. **Legend Strip** — Color scale bar at bottom left for active map layer

---

### PAGE 4 — HISTORY LOG
**Layout:** Vertical feed

**Sections:**
1. **Section Header** — "Your Activity Log" + filter chips: All / Walk / Run / Cycle
2. **Week Summary Card** — Total activities, avg safety score, best day
3. **Activity Feed** — Each entry card:
   - Activity icon + type
   - Date/time
   - Safety score badge (colored)
   - Condition snapshot: temp · UV · AQI
   - "View Details" link
4. **Weekly Trend Chart** — Horizontal bar chart, score per day, amber bars

---

### PAGE 5 — PROFILE / HEALTH SETUP
**Layout:** Form-style scrollable settings page

**Sections:**
1. **Avatar + Name + Location** — Large centered avatar, editable name
2. **Health Profile Form Cards:**
   - Age (stepper input)
   - Fitness Level (pill selector: Beginner / Moderate / Athletic)
   - Health Conditions (multi-select chips: Asthma · Hypertension · Diabetes · Heart Disease · None)
   - Weight range (optional)
3. **Preferences Card** — Default activity, preferred workout times
4. **Connected Devices** — Wearable sync row (Apple Watch / Fitbit / Garmin)
5. **Notification Settings** — Toggle rows with descriptions
6. **Weekly Report** — Toggle to receive AI-generated weekly fitness-weather PDF

---

## d. COMPONENT SPECS

### Buttons
```css
/* Primary */
.btn-primary {
  background: #E8B94F;
  color: #111110;
  font-weight: 700;
  font-size: 15px;
  border-radius: 999px;
  padding: 14px 32px;
  letter-spacing: -0.01em;
}

/* Ghost */
.btn-ghost {
  background: transparent;
  border: 1px solid rgba(245, 237, 216, 0.18);
  color: #F5EDD8;
  font-weight: 500;
  border-radius: 999px;
  padding: 12px 28px;
}
```

### Cards
```css
.card {
  background: #1A1916;
  border: 1px solid rgba(255, 248, 235, 0.08);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.35);
}
```

### Safety Score Ring
```css
/* SVG circle stroke-dasharray animated */
/* Safe:    stroke #7DBF72 */
/* Caution: stroke #E8B94F */
/* Danger:  stroke #D96B4E */
/* Center text: font-family mono, font-size 52px, font-weight 800 */
```

### Bottom Navigation
```css
.bottom-nav {
  background: #1E1C18;
  border-radius: 28px;
  padding: 10px 20px;
  display: flex;
  gap: 8px;
  /* active icon: gold circle bg #E8B94F, icon color #111110, scale 1.05 */
}
```

### Data Pill
```css
.data-pill {
  background: #222119;
  border: 1px solid rgba(255,248,235,0.08);
  border-radius: 14px;
  padding: 12px 16px;
  /* icon (16px, --text-secondary) + value (18px bold, --accent-warm-white) + label (11px, --text-secondary) */
}
```

### Risk Bar
```css
.risk-bar-track { background: #2A2620; height: 6px; border-radius: 999px; }
.risk-bar-fill   { border-radius: 999px; height: 6px; 
  /* safe: #7DBF72 · caution: #E8B94F · danger: #D96B4E */ }
```

---

## e. BUILD INSTRUCTIONS FOR STITCH

**Stack:** React + Tailwind CSS (with custom CSS variables) + Recharts for data viz + Framer Motion for animations

**Step 1 — Setup tokens**
Define all CSS variables above in `:root`. Import Google Fonts: `DM Sans` (body) + `JetBrains Mono` (numbers). Use `Neue Haas Grotesk` via local or fallback to `"Arial Black"` for display.

**Step 2 — Build shell**
App shell: `#111110` full-height background. Centered column `max-width: 430px` with `margin: 0 auto`. Bottom nav fixed at bottom inside this column. Top bar sticky.

**Step 3 — Build Home screen first**
Render top bar → hero weather card (hard-coded demo data: 32°C, Delhi, Partly Cloudy) → activity selector 3 cards (Walk/Run/Cycle) → time slot horizontal scroller → "Check Safety Now" gold CTA button → optimal windows bar chart card → stats row → bottom nav.

**Step 4 — Build Predict/Result screen**
On CTA click, transition to result screen with Framer Motion page slide. Render: activity summary pill → animated SVG donut score (animate stroke-dasharray from 0 to score value over 800ms) → verdict badge with pulse animation → 6 risk factor cards (stagger fade-in 60ms each) → Recharts LineChart (temperature hourly) → Recharts AreaChart (heat index) → AI recommendation card (static placeholder text) → action buttons.

**Step 5 — Build Map screen**
Use a dark sepia-style static map image as placeholder background. Float layer toggle buttons on right. Float a bottom sheet with 2 dummy location cards showing safety score badges.

**Step 6 — Build History screen**
Week summary card → 4 dummy activity log cards with colored safety score badges → Recharts BarChart for weekly scores.

**Step 7 — Build Profile screen**
Editable form cards with pill-selector for fitness level, multi-select chips for health conditions, toggle rows for notifications.

**Step 8 — Wire navigation**
Bottom nav switches between all 5 screens. Active tab shows gold circle behind icon.

**Step 9 — Polish pass**
- All cards: hover lift `translateY(-2px)` with `transition: 200ms ease`
- Page enter: `opacity 0 → 1` + `translateY(12px → 0)` over `300ms`
- Score ring: stroke animation on mount
- Charts: `animationBegin: 0, animationDuration: 1000`
- Bottom nav active icon: scale + gold bg transition `200ms`
- Gradient text on "HeatGuard" wordmark: `linear-gradient(135deg, #E8B94F, #F5EDD8)`

**Step 10 — Responsive**
On desktop: center the 430px app column with the remaining viewport showing a subtle warm grain texture background (`noise.svg` overlay at 3% opacity over `#0D0C0A`).

---

*Now analyze the design reference video frames visually, then begin building the UI in Stitch immediately without asking any clarifying questions.*