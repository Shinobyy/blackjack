import { PrismaClient as PostgresClient } from "../../db/postgres/prisma/client.ts";
import { PrismaClient as MongoClient } from "../../db/mongodb/prisma/client.ts";
import UserService from "./user.ts";
import BotService from "./bot.ts";
import TournamentService from "./tournament.ts";
import GameService from "./game.ts";
import { v4 as uuidv4 } from 'uuid';

// Types et interfaces
interface Card {
    value: string;
    suit: string;
}

interface Round {
    id: string;
    type: "PLAYER" | "BOT" | "DEALER";
    name?: string; // Nom du bot (optionnel pour PLAYER et DEALER)
    initialHand: string[];
    action?: "HIT" | "STAND";
    score?: number;
    turn: number;
    result?: {
        hand: string[];
        score: number;
        isBusted: boolean;
    };
}

interface GameState {
    gameId: string;
    tournamentId: string;
    rounds: Round[];
    winnerId: string | null;
    metadata: {
        durationSeconds: number;
    };
    startTime: Date;
}

export default class RulesService {
    private pgClient: PostgresClient;
    private mongoClient: MongoClient;
    private userService: UserService;
    private botService: BotService;
    private tournamentService: TournamentService;
    private gameService: GameService;

    private deck: string[] = [];
    private suits = ['♣', '♦', '♥', '♠'];
    private values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    constructor() {
        this.pgClient = new PostgresClient();
        this.mongoClient = new MongoClient();
        this.userService = new UserService();
        this.botService = new BotService();
        this.tournamentService = new TournamentService();
        this.gameService = new GameService();
    }

    // ========== GESTION DES CARTES ==========

    /**
     * Initialise un nouveau deck de 52 cartes et le mélange
     */
    private initializeDeck(): void {
        this.deck = [];
        for (const suit of this.suits) {
            for (const value of this.values) {
                this.deck.push(`${value}${suit}`);
            }
        }
        this.shuffleDeck();
    }

    /**
     * Mélange le deck
     */
    private shuffleDeck(): void {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j]!, this.deck[i]!];
        }
    }

    /**
     * Tire une carte du deck
     */
    private drawCard(): string {
        if (this.deck.length === 0) {
            this.initializeDeck();
        }
        return this.deck.pop()!;
    }

    /**
     * Calcule le score d'une main
     */
    private calculateScore(hand: string[]): number {
        let score = 0;
        let aces = 0;

        for (const card of hand) {
            const value = card.slice(0, -1); // Retire le symbole de la suite
            
            if (value === 'A') {
                aces++;
                score += 11;
            } else if (['J', 'Q', 'K'].includes(value)) {
                score += 10;
            } else {
                score += parseInt(value);
            }
        }

        // Ajuste les As si nécessaire
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }

        return score;
    }

    /**
     * Vérifie si une main est un blackjack
     */
    private isBlackjack(hand: string[]): boolean {
        return hand.length === 2 && this.calculateScore(hand) === 21;
    }

    // ========== CRÉATION DE PARTIE ==========

    /**
     * Crée une nouvelle partie 1v1 (Utilisateur vs Croupier)
     */
    async createGame1v1(sessionId: string, username: string, entryBlind: number): Promise<GameState> {
        // Vérifier si l'utilisateur existe déjà avec ce session_id
        let user = await this.userService.findBySessionId(sessionId);
        
        // Si l'utilisateur n'existe pas, le créer
        if (!user) {
            user = await this.userService.create({
                session_id: sessionId,
                username: username,
                max_profit: 15000 // Valeur par défaut
            });
        }

        if (entryBlind > user.max_profit) {
            throw new Error(`Mise invalide. Votre solde maximum est ${user.max_profit}`);
        }

        // Créer un tournoi temporaire
        const tournament = await this.tournamentService.create({
            user_id: user.id,
            active: true
        });

        // Initialiser le deck
        this.initializeDeck();

        // Distribuer les cartes initiales
        const playerHand = [this.drawCard(), this.drawCard()];
        const dealerHand = [this.drawCard(), this.drawCard()];

        const rounds: Round[] = [
            {
                id: user.id,
                type: "PLAYER",
                initialHand: playerHand,
                turn: 0,
                result: {
                    hand: playerHand,
                    score: this.calculateScore(playerHand),
                    isBusted: false
                }
            },
            {
                id: "-1",
                type: "DEALER",
                initialHand: dealerHand,
                turn: 0,
                result: {
                    hand: dealerHand,
                    score: this.calculateScore(dealerHand),
                    isBusted: false
                }
            }
        ];

        const gameId = uuidv4();

        // Créer la partie dans MongoDB
        const gameData = {
            _id: gameId,
            tournamentId: tournament.id,
            timestamp: new Date(),
            rounds: rounds,
            winnerId: null,
            metadata: {
                durationSeconds: 0
            }
        };


        const gameResult = await this.gameService.create(gameData);

        return {
            gameId: gameId,
            tournamentId: tournament.id,
            rounds: rounds,
            winnerId: null,
            metadata: {
                durationSeconds: 0
            },
            startTime: new Date()
        };
    }

    /**
     * Crée une nouvelle partie tournoi (Utilisateur + Bots vs Croupier)
     */
    async createTournament(sessionId: string, username: string, entryBlind: number, numberOfBots: number = 3): Promise<GameState> {
        // Vérifier si l'utilisateur existe déjà avec ce session_id
        let user = await this.userService.findBySessionId(sessionId);
        
        // Si l'utilisateur n'existe pas, le créer
        if (!user) {
            user = await this.userService.create({
                session_id: sessionId,
                username: username,
                max_profit: 15000 // Valeur par défaut
            });
        }

        if (entryBlind > user.max_profit) {
            throw new Error(`Mise invalide. Votre solde maximum est ${user.max_profit}`);
        }

        // Créer un tournoi
        const tournament = await this.tournamentService.create({
            user_id: user.id,
            active: true
        });

        // Générer des bots
        const bots = await this.generateBots(numberOfBots);

        // Initialiser le deck
        this.initializeDeck();

        // Distribuer les cartes
        const rounds: Round[] = [];
        
        // Carte du joueur
        const playerHand = [this.drawCard(), this.drawCard()];
        rounds.push({
            id: user.id,
            type: "PLAYER",
            initialHand: playerHand,
            turn: 0,
            result: {
                hand: playerHand,
                score: this.calculateScore(playerHand),
                isBusted: false
            }
        });

        // Cartes des bots
        for (const bot of bots) {
            const botHand = [this.drawCard(), this.drawCard()];
            rounds.push({
                id: bot.id,
                type: "BOT",
                name: bot.username,
                initialHand: botHand,
                turn: 0,
                result: {
                    hand: botHand,
                    score: this.calculateScore(botHand),
                    isBusted: false
                }
            });
        }

        // Cartes du croupier
        const dealerHand = [this.drawCard(), this.drawCard()];
        rounds.push({
            id: "-1",
            type: "DEALER",
            initialHand: dealerHand,
            turn: 0,
            result: {
                hand: dealerHand,
                score: this.calculateScore(dealerHand),
                isBusted: false
            }
        });

        const gameId = uuidv4();

        // Créer la partie dans MongoDB
        const gameData = {
            _id: gameId,
            tournamentId: tournament.id,
            timestamp: new Date(),
            rounds: rounds,
            winnerId: null,
            metadata: {
                durationSeconds: 0
            }
        };

        const gameResult = await this.gameService.create(gameData);

        return {
            gameId: gameId,
            tournamentId: tournament.id,
            rounds: rounds,
            winnerId: null,
            metadata: {
                durationSeconds: 0
            },
            startTime: new Date()
        };
    }

    /**
     * Génère des bots avec des noms aléatoires
     */
    private async generateBots(count: number): Promise<any[]> {
        const botNames = [
            "Alpha", "Beta", "Gamma", "Delta", "Epsilon",
            "Zeta", "Eta", "Theta", "Iota", "Kappa",
            "Lambda", "Mu", "Nu", "Xi", "Omicron"
        ];

        const bots = [];
        for (let i = 0; i < count; i++) {
            const randomName = botNames[Math.floor(Math.random() * botNames.length)] + "_" + Math.floor(Math.random() * 1000);
            const bot = await this.botService.create({ username: randomName });
            bots.push(bot);
        }

        return bots;
    }

    // ========== ACTIONS DE JEU ==========

    /**
     * Action du joueur : Hit (piocher une carte)
     */
    async playerHit(gameId: string, playerId: string): Promise<Round> {
        // Récupérer la partie
        const game = await this.gameService.findById(gameId);
        if (!game) {
            throw new Error("Partie non trouvée");
        }

        // Trouver le round du joueur
        console.log("ROUNDS ACTUELS: ", game);
        const rounds = game.cursor.firstBatch[0].rounds || [];
        const playerRounds = rounds.filter((r: Round) => r.id === playerId && r.type === "PLAYER");
        const lastPlayerRound = playerRounds[playerRounds.length - 1];

        if (!lastPlayerRound) {
            throw new Error("Round du joueur non trouvé");
        }

        // Piocher une carte
        this.initializeDeck(); // Réinitialiser le deck
        const newCard = this.drawCard();
        const newHand = [...lastPlayerRound.result.hand, newCard];
        const newScore = this.calculateScore(newHand);
        const isBusted = newScore > 21;

        // Créer un nouveau round
        const newRound: Round = {
            id: playerId,
            type: "PLAYER",
            initialHand: lastPlayerRound.initialHand,
            action: "HIT",
            score: newScore,
            turn: lastPlayerRound.turn + 1,
            result: {
                hand: newHand,
                score: newScore,
                isBusted: isBusted
            }
        };

        // Mettre à jour la partie
        rounds.push(newRound);
        await this.gameService.updateById(gameId, { rounds });

        return newRound;
    }

    /**
     * Action du joueur : Stand (rester)
     */
    async playerStand(gameId: string, playerId: string): Promise<Round> {
    // Récupérer la partie
    const game = await this.gameService.findById(gameId);
    if (!game) {
        throw new Error("Partie non trouvée");
    }

    console.log("ROUNDS ACTUELS: ",  game.cursor.firstBatch[0]);
    // Vérifier si les rounds existent
    const rounds = game.cursor.firstBatch[0].rounds || [];
    if (rounds.length === 0) {
        throw new Error("Aucun round trouvé dans cette partie");
    }

    // Trouver le dernier round du joueur
    const playerRounds = rounds.filter((r: Round) => r.id === playerId && r.type === "PLAYER");
    const lastPlayerRound = playerRounds[playerRounds.length - 1];

    if (!lastPlayerRound) {
        throw new Error("Round du joueur non trouvé");
    }

    // Créer un nouveau round avec l'action "STAND"
    const newRound: Round = {
        id: playerId,
        type: "PLAYER",
        initialHand: lastPlayerRound.initialHand,
        action: "STAND",
        score: lastPlayerRound.result!.score,
        turn: lastPlayerRound.turn + 1,
        result: {
            hand: lastPlayerRound.result!.hand,
            score: lastPlayerRound.result!.score,
            isBusted: lastPlayerRound.result!.isBusted
        }
    };

    // Ajouter le nouveau round et mettre à jour la partie
    rounds.push(newRound);
    await this.gameService.updateById(gameId, { rounds });

    return newRound;
}

    /**
     * Logique automatique des bots
     */
    async playBotTurn(gameId: string, botId: string): Promise<Round> {
        const game = await this.gameService.findById(gameId);
        if (!game) {
            throw new Error("Partie non trouvée");
        }

        const rounds = game.cursor.firstBatch[0].rounds || [];
        const botRounds = rounds.filter((r: Round) => r.id === botId && r.type === "BOT");
        const lastBotRound = botRounds[botRounds.length - 1];

        if (!lastBotRound) {
            throw new Error("Round du bot non trouvé");
        }

        this.initializeDeck();
        
        let newRound: Round;
        
        // Logique simple : hit si score < 17, stand sinon
        if (lastBotRound.result!.score < 17 && !lastBotRound.result!.isBusted) {
            const newCard = this.drawCard();
            const newHand = [...lastBotRound.result!.hand, newCard];
            const newScore = this.calculateScore(newHand);
            const isBusted = newScore > 21;

            newRound = {
                id: botId,
                type: "BOT",
                name: lastBotRound.name, // Préserver le nom du bot
                initialHand: lastBotRound.initialHand,
                action: "HIT",
                score: newScore,
                turn: lastBotRound.turn + 1,
                result: {
                    hand: newHand,
                    score: newScore,
                    isBusted: isBusted
                }
            };
        } else {
            newRound = {
                id: botId,
                type: "BOT",
                name: lastBotRound.name, // Préserver le nom du bot
                initialHand: lastBotRound.initialHand,
                action: "STAND",
                score: lastBotRound.result!.score,
                turn: lastBotRound.turn + 1,
                result: {
                    hand: lastBotRound.result!.hand,
                    score: lastBotRound.result!.score,
                    isBusted: lastBotRound.result!.isBusted
                }
            };
        }

        rounds.push(newRound);
        await this.gameService.updateById(gameId, { rounds });

        return newRound;
    }

    /**
     * Logique automatique du croupier
     */
    async playDealerTurn(gameId: string): Promise<Round> {
        const game = await this.gameService.findById(gameId);
        if (!game) {
            throw new Error("Partie non trouvée");
        }

        const rounds = game.cursor.firstBatch[0].rounds || [];
        const dealerRounds = rounds.filter((r: Round) => r.id === "-1" && r.type === "DEALER");
        const lastDealerRound = dealerRounds[dealerRounds.length - 1];

        if (!lastDealerRound) {
            throw new Error("Round du croupier non trouvé");
        }

        this.initializeDeck();
        
        let newRound: Round;

        // Logique du croupier : hit jusqu'à 17, stand après
        if (lastDealerRound.result!.score < 17) {
            const newCard = this.drawCard();
            const newHand = [...lastDealerRound.result!.hand, newCard];
            const newScore = this.calculateScore(newHand);
            const isBusted = newScore > 21;

            newRound = {
                id: "-1",
                type: "DEALER",
                initialHand: lastDealerRound.initialHand,
                action: "HIT",
                score: newScore,
                turn: lastDealerRound.turn + 1,
                result: {
                    hand: newHand,
                    score: newScore,
                    isBusted: isBusted
                }
            };
        } else {
            newRound = {
                id: "-1",
                type: "DEALER",
                initialHand: lastDealerRound.initialHand,
                action: "STAND",
                score: lastDealerRound.result!.score,
                turn: lastDealerRound.turn + 1,
                result: {
                    hand: lastDealerRound.result!.hand,
                    score: lastDealerRound.result!.score,
                    isBusted: lastDealerRound.result!.isBusted
                }
            };
        }

        rounds.push(newRound);
        await this.gameService.updateById(gameId, { rounds });

        return newRound;
    }

    // ========== FIN DE PARTIE ==========

    /**
     * Termine la partie et détermine le gagnant
     */
    async endGame(gameId: string, startTime: Date): Promise<any> {
        // Récupérer l'état du jeu formaté
        const gameData = await this.getGameState(gameId);
        
        const rounds = gameData.rounds || [];
        
        // Obtenir les derniers rounds de chaque participant
        const participants = new Map<string, Round>();
        
        for (const round of rounds) {
            participants.set(round.id, round);
        }

        // Déterminer le gagnant
        let winnerId = null;
        let bestScore = 0;
        let hasBlackjack = false;

        for (const [id, round] of participants.entries()) {
            if (!round.result || round.result.isBusted) continue;

            const score = round.result.score;
            const isBlackjack = this.isBlackjack(round.result.hand);

            if (isBlackjack && !hasBlackjack) {
                winnerId = id;
                bestScore = score;
                hasBlackjack = true;
            } else if (!hasBlackjack && score > bestScore && score <= 21) {
                winnerId = id;
                bestScore = score;
            } else if (hasBlackjack && isBlackjack && score > bestScore) {
                winnerId = id;
                bestScore = score;
            }
        }

        // Calculer la durée
        const durationSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

        // Mettre à jour la partie
        await this.gameService.updateById(gameId, {
            winnerId: winnerId,
            metadata: { durationSeconds }
        });

        // Mettre à jour le profit de l'utilisateur si c'est lui qui a gagné
        if (winnerId && winnerId !== "-1") {
            const tournament = await this.tournamentService.findById(gameData.tournamentId);
            if (tournament) {
                const user = await this.userService.findById(tournament.user_id);
                if (user && winnerId === tournament.user_id) {
                    // L'utilisateur a gagné, on augmente son profit
                    // Pour simplifier, on ajoute 100 au profit (à adapter selon la mise)
                    await this.userService.updateById(user.id, {
                        max_profit: Number(user.max_profit) + 100
                    });
                }
            }
        }

        // Désactiver le tournoi
        const tournament = await this.tournamentService.findById(gameData.tournamentId);
        if (tournament) {
            await this.tournamentService.updateById(tournament.id, { active: false });
        }

        return {
            gameId,
            winnerId,
            bestScore,
            durationSeconds,
            participants: Array.from(participants.values())
        };
    }

    /**
     * Obtenir l'état actuel d'une partie
     */
    async getGameState(gameId: string): Promise<any> {
        const game = await this.gameService.findById(gameId);
        if (!game) {
            throw new Error("Partie non trouvée");
        }

        // Extraire les données du curseur MongoDB
        const gameData = (game as any).cursor?.firstBatch?.[0];
        if (!gameData) {
            throw new Error("Données de partie non trouvées");
        }

        return {
            _id: gameData._id,
            tournamentId: gameData.tournamentId,
            timestamp: gameData.timestamp,
            rounds: gameData.rounds || [],
            winnerId: gameData.winnerId,
            metadata: gameData.metadata
        };
    }

    async disconnect(): Promise<void> {
        await this.pgClient.$disconnect();
        await this.mongoClient.$disconnect();
    }
}
