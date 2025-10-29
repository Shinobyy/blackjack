import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.ts';
import botRoutes from './routes/bot.ts';
import tournamentRoutes from './routes/tournament.ts';
import gameRoutes from './routes/game.ts';
import analyticsRoutes from './routes/analytics.ts';
import rulesRoutes from './routes/rules.ts';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swaggerDocument = JSON.parse(
  readFileSync(join(__dirname, '../docs/swagger.json'), 'utf-8')
);

import dotenv from 'dotenv';
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/users', userRoutes);
app.use('/bots', botRoutes);
app.use('/tournaments', tournamentRoutes);
app.use('/games', gameRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/rules', rulesRoutes);


app.listen(3078, () => {
  console.log('Server is running on http://localhost:3078');
});