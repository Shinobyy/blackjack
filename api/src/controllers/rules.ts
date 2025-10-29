import { type Request, type Response, type NextFunction } from 'express';
import RulesService from '../services/rules.ts';

const rulesService = new RulesService();

/**
 * POST /rules/game/1v1
 * Crée une partie 1v1 (Utilisateur vs Croupier)
 */
export const createGame1v1 = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId, username, entryBlind } = req.body;

        if (!sessionId || !username || !entryBlind) {
            return res.status(400).json({
                success: false,
                message: 'sessionId, username et entryBlind sont requis'
            });
        }

        if (entryBlind <= 0) {
            return res.status(400).json({
                success: false,
                message: 'La mise doit être supérieure à 0'
            });
        }

        const gameState = await rulesService.createGame1v1(sessionId, username, entryBlind);

        res.status(201).json({
            success: true,
            data: gameState,
            message: 'Partie 1v1 créée avec succès'
        });
    } catch (error: any) {
        if (error.message.includes('non trouvé') || error.message.includes('invalide')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * POST /rules/game/tournament
 * Crée une partie tournoi (Utilisateur + Bots vs Croupier)
 */
export const createTournament = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body || {};
        console.log('Request Body:', body);
        const { sessionId, username, entryBlind, numberOfBots = 3 } = body;

        if (!sessionId || !username || !entryBlind) {
            return res.status(400).json({
                success: false,
                message: 'sessionId, username et entryBlind sont requis'
            });
        }

        if (entryBlind <= 0) {
            return res.status(400).json({
                success: false,
                message: 'La mise doit être supérieure à 0'
            });
        }

        if (numberOfBots < 1 || numberOfBots > 10) {
            return res.status(400).json({
                success: false,
                message: 'Le nombre de bots doit être entre 1 et 10'
            });
        }

        const gameState = await rulesService.createTournament(sessionId, username, entryBlind, numberOfBots);

        res.status(201).json({
            success: true,
            data: gameState,
            message: 'Tournoi créé avec succès'
        });
    } catch (error: any) {
        if (error.message.includes('non trouvé') || error.message.includes('invalide')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * POST /rules/game/:gameId/player/:playerId/hit
 * Action du joueur : piocher une carte
 */
export const playerHit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { gameId, playerId } = req.params;

        if (!gameId || !playerId) {
            return res.status(400).json({
                success: false,
                message: 'gameId et playerId sont requis'
            });
        }

        const round = await rulesService.playerHit(gameId, playerId);

        res.status(200).json({
            success: true,
            data: round,
            message: round.result.isBusted ? 'Busted! Vous avez dépassé 21' : 'Carte piochée avec succès'
        });
    } catch (error: any) {
        if (error.message.includes('non trouvé')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * POST /rules/game/:gameId/player/:playerId/stand
 * Action du joueur : rester
 */
export const playerStand = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { gameId, playerId } = req.params;

        if (!gameId || !playerId) {
            return res.status(400).json({
                success: false,
                message: 'gameId et playerId sont requis'
            });
        }

        const round = await rulesService.playerStand(gameId, playerId);

        res.status(200).json({
            success: true,
            data: round,
            message: 'Vous avez choisi de rester'
        });
    } catch (error: any) {
        if (error.message.includes('non trouvé')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * POST /rules/game/:gameId/bot/:botId/play
 * Action automatique d'un bot
 */
export const playBotTurn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { gameId, botId } = req.params;

        if (!gameId || !botId) {
            return res.status(400).json({
                success: false,
                message: 'gameId et botId sont requis'
            });
        }

        const round = await rulesService.playBotTurn(gameId, botId);

        res.status(200).json({
            success: true,
            data: round,
            message: `Bot a joué: ${round.action}`
        });
    } catch (error: any) {
        if (error.message.includes('non trouvé')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * POST /rules/game/:gameId/dealer/play
 * Action automatique du croupier
 */
export const playDealerTurn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { gameId } = req.params;

        if (!gameId) {
            return res.status(400).json({
                success: false,
                message: 'gameId est requis'
            });
        }

        const round = await rulesService.playDealerTurn(gameId);

        res.status(200).json({
            success: true,
            data: round,
            message: `Croupier a joué: ${round.action}`
        });
    } catch (error: any) {
        if (error.message.includes('non trouvé')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * POST /rules/game/:gameId/end
 * Termine la partie et détermine le gagnant
 */
export const endGame = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { gameId } = req.params;
        const { startTime } = req.body;

        if (!gameId) {
            return res.status(400).json({
                success: false,
                message: 'gameId est requis'
            });
        }

        const startDate = startTime ? new Date(startTime) : new Date();
        const result = await rulesService.endGame(gameId, startDate);

        let message = 'Partie terminée';
        if (result.winnerId === '-1') {
            message = 'Le croupier a gagné!';
        } else if (result.winnerId) {
            message = `Le gagnant est ${result.winnerId} avec un score de ${result.bestScore}`;
        } else {
            message = 'Egalité ou tous les joueurs ont busted';
        }

        res.status(200).json({
            success: true,
            data: result,
            message: message
        });
    } catch (error: any) {
        if (error.message.includes('non trouvé')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * GET /rules/game/:gameId/state
 * Obtient l'état actuel d'une partie
 */
export const getGameState = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { gameId } = req.params;

        if (!gameId) {
            return res.status(400).json({
                success: false,
                message: 'gameId est requis'
            });
        }

        const gameState = await rulesService.getGameState(gameId);
        
        res.status(200).json({
            success: true,
            data: gameState
        });
    } catch (error: any) {
        if (error.message.includes('non trouvé')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * POST /rules/game/:gameId/auto-play
 * Joue automatiquement tous les bots et le croupier
 */
export const autoPlay = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { gameId } = req.params;

        if (!gameId) {
            return res.status(400).json({
                success: false,
                message: 'gameId est requis'
            });
        }

        // Récupérer l'état du jeu
        const game = await rulesService.getGameState(gameId);
        const rounds = game.rounds || [];

        // Identifier tous les bots
        const botIds = new Set<string>();
        for (const round of rounds) {
            if (round.type === 'BOT') {
                botIds.add(round.id);
            }
        }

        // Jouer les tours des bots
        const botResults = [];
        for (const botId of botIds) {
            // Continuer à jouer tant que le bot n'a pas fait STAND ou BUST
            let botRound = await rulesService.playBotTurn(gameId, botId);
            botResults.push(botRound);
            
            // Le bot continue de jouer jusqu'à ce qu'il fasse STAND ou BUST
            while (botRound.action === 'HIT' && !botRound.result?.isBusted) {
                botRound = await rulesService.playBotTurn(gameId, botId);
                botResults.push(botRound);
            }
        }

        // Jouer le tour du croupier - continuer jusqu'à 17 ou plus
        const dealerResults = [];
        let dealerRound = await rulesService.playDealerTurn(gameId);
        dealerResults.push(dealerRound);
        
        // Le croupier continue de tirer tant qu'il a moins de 17 et n'est pas busted
        while (dealerRound.action === 'HIT' && !dealerRound.result?.isBusted) {
            dealerRound = await rulesService.playDealerTurn(gameId);
            dealerResults.push(dealerRound);
        }

        res.status(200).json({
            success: true,
            data: {
                bots: botResults,
                dealer: dealerResults
            },
            message: 'Tous les bots et le croupier ont joué'
        });
    } catch (error: any) {
        if (error.message.includes('non trouvé')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};
