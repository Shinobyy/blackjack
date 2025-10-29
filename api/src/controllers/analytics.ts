import { type Request, type Response, type NextFunction } from 'express';
import AnalyticsService from '../services/analytics.ts';

const analyticsService = new AnalyticsService();

export const getPlayerRanking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rankings = await analyticsService.getPlayerRankingByTotalGains();
    res.json(rankings);
  } catch (error) {
    next(error);
  }
};

export const getAverageBets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const avgBets = await analyticsService.getAverageBetsPerGame();
    res.json({ averageBets: avgBets });
  } catch (error) {
    next(error);
  }
};

export const getTopActivePlayers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topPlayers = await analyticsService.getTopActivePlayers();
    res.json(topPlayers);
  } catch (error) {
    next(error);
  }
};

export const getBestWinRatePlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bestPlayer = await analyticsService.getBestWinRatePlayer();
    res.json(bestPlayer);
  } catch (error) {
    next(error);
  }
};