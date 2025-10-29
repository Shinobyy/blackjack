import express from 'express';
import userRoutes from './routes/user.ts';
import botRoutes from './routes/bot.ts';
import tournamentRoutes from './routes/tournament.ts';
import gameRoutes from './routes/game.ts';
import analyticsRoutes from './routes/analytics.ts';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../docs/swagger.json' with { type: 'json' };

import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/users', userRoutes);
app.use('/bots', botRoutes);
app.use('/tournaments', tournamentRoutes);
app.use('/games', gameRoutes);
app.use('/analytics', analyticsRoutes);


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});