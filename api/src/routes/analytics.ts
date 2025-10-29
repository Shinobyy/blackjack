import { Router } from 'express';
import {
  getPlayerRanking,
  getAverageBets,
  getTopActivePlayers,
  getBestWinRatePlayer,
} from '../controllers/analytics.ts';

const router = Router();

router.get('/ranking', getPlayerRanking);
router.get('/average-bets', getAverageBets);
router.get('/top-active', getTopActivePlayers);
router.get('/best-win-rate', getBestWinRatePlayer);

export default router;