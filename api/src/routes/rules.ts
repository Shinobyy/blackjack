import { Router } from 'express';
import {
    createGame1v1,
    createTournament,
    playerHit,
    playerStand,
    playBotTurn,
    playDealerTurn,
    endGame,
    getGameState,
    autoPlay
} from '../controllers/rules.ts';

const router = Router();

// Création de parties
router.post('/game/1v1', createGame1v1);
router.post('/game/tournament', createTournament);

// Actions du joueur
router.post('/game/:gameId/player/:playerId/hit', playerHit);
router.post('/game/:gameId/player/:playerId/stand', playerStand);

// Actions automatiques
router.post('/game/:gameId/bot/:botId/play', playBotTurn);
router.post('/game/:gameId/dealer/play', playDealerTurn);
router.post('/game/:gameId/auto-play', autoPlay);

// Fin de partie et état
router.post('/game/:gameId/end', endGame);
router.get('/game/:gameId/state', getGameState);

export default router;
