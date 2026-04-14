import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { calculateRisk } from './engine/heatRiskEngine';

const app = express();
app.use(cors());
app.use(express.json());

// Mock weather data as per agent.md
const MOCK_HOURLY = [
  { hour: 0,  temperature: 28, humidity: 82 },
  { hour: 1,  temperature: 27, humidity: 84 },
  { hour: 2,  temperature: 27, humidity: 85 },
  { hour: 3,  temperature: 26, humidity: 86 },
  { hour: 4,  temperature: 26, humidity: 86 },
  { hour: 5,  temperature: 27, humidity: 84 },
  { hour: 6,  temperature: 28, humidity: 82 },
  { hour: 7,  temperature: 30, humidity: 78 },
  { hour: 8,  temperature: 33, humidity: 74 },
  { hour: 9,  temperature: 35, humidity: 70 },
  { hour: 10, temperature: 37, humidity: 68 },
  { hour: 11, temperature: 38, humidity: 66 },
  { hour: 12, temperature: 39, humidity: 65 },
  { hour: 13, temperature: 40, humidity: 64 },
  { hour: 14, temperature: 40, humidity: 63 },
  { hour: 15, temperature: 39, humidity: 64 },
  { hour: 16, temperature: 38, humidity: 66 },
  { hour: 17, temperature: 37, humidity: 68 },
  { hour: 18, temperature: 35, humidity: 70 },
  { hour: 19, temperature: 33, humidity: 73 },
  { hour: 20, temperature: 32, humidity: 75 },
  { hour: 21, temperature: 31, humidity: 77 },
  { hour: 22, temperature: 30, humidity: 79 },
  { hour: 23, temperature: 29, humidity: 81 }
];

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/weather', (req, res) => {
  // Return the mock weather data fallback
  res.json({
    source: 'mock',
    city: req.query.city || 'Mumbai',
    temperature: 36,
    humidity: 70,
    currentHour: new Date().getHours(),
    description: 'Mock data — API unavailable',
    hourlyForecast: MOCK_HOURLY
  });
});

const calculateSchema = z.object({
  temperature: z.number().min(20).max(50),
  humidity: z.number().min(20).max(100),
  currentHour: z.number().min(0).max(23),
  activityType: z.enum(['walking', 'running', 'cycling', 'sports', 'labor', 'hiking']),
  duration: z.enum(['<30', '30-60', '>60']),
  ageGroup: z.enum(['child', 'adult', 'senior']),
  healthConditions: z.array(z.enum(['heart', 'diabetes', 'respiratory', 'pregnant'])),
  hourlyForecast: z.array(z.object({
    hour: z.number(),
    temperature: z.number(),
    humidity: z.number()
  }))
});

app.post('/api/calculate', (req, res) => {
  try {
    const input = calculateSchema.parse(req.body);
    // Cast input to UserInput after validation
    const result = calculateRisk(input as any);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: error.errors });
    } else {
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`HeatGuard Backend listening on port ${PORT}`);
});
