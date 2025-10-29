'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../components/Card';
import { calculateHandScore } from '../utils/cards';

const API_URL = 'http://localhost:3000';

interface Round {
  id: string;
  type: 'PLAYER' | 'BOT' | 'DEALER';
  name?: string; // Nom du bot
  initialHand: string[];
  action?: 'HIT' | 'STAND';
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
  startTime: string;
}

export default function GamePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerHand, setPlayerHand] = useState<string[]>([]);
  const [dealerHand, setDealerHand] = useState<string[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [botRounds, setBotRounds] = useState<Round[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [entryBlind, setEntryBlind] = useState(100);
  const [showBetModal, setShowBetModal] = useState(true);
  const [playerId, setPlayerId] = useState('');

  useEffect(() => {
    // Vérifier si l'utilisateur a bien rempli les infos
    const username = localStorage.getItem('blackjack_username');
    const sessionId = localStorage.getItem('blackjack_sessionId');
    
    if (!username || !sessionId) {
      router.push('/');
      return;
    }
    
    setLoading(false);
  }, [router]);

  const createGame = async () => {
    const username = localStorage.getItem('blackjack_username');
    const sessionId = localStorage.getItem('blackjack_sessionId');
    const gameMode = localStorage.getItem('blackjack_gameMode');
    const numberOfBots = parseInt(localStorage.getItem('blackjack_numberOfBots') || '3');

    if (!username || !sessionId) {
      router.push('/');
      return;
    }

    try {
      setLoading(true);
      const endpoint = gameMode === '1v1' ? '/rules/game/1v1' : '/rules/game/tournament';
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          username,
          entryBlind,
          ...(gameMode === 'tournament' && { numberOfBots })
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création de la partie');
      }

      const data = await response.json();
      console.log("Game created: ", data);
      setGameState(data.data);
      
      // Extraire les mains initiales
      const rounds = data.data.rounds;
      const playerRound = rounds.find((r: Round) => r.type === 'PLAYER');
      const dealerRound = rounds.find((r: Round) => r.type === 'DEALER');
      const botRoundsData = rounds.filter((r: Round) => r.type === 'BOT');

      if (playerRound && playerRound.result) {
        setPlayerHand(playerRound.result.hand);
        setPlayerScore(playerRound.result.score);
        setPlayerId(playerRound.id);
      }

      if (dealerRound && dealerRound.result) {
        const visibleCards = [dealerRound.result.hand[0]!, '🂠']; // Cacher la 2ème carte
        setDealerHand(visibleCards);
        // Calculer le score de la carte visible uniquement
        const visibleScore = calculateHandScore([dealerRound.result.hand[0]!]);
        setDealerScore(visibleScore);
      }

      // Stocker les rounds des bots
      setBotRounds(botRoundsData);

      setMessage('Votre tour ! Hit ou Stand ?');
      setShowBetModal(false);
      setLoading(false);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleHit = async () => {
    if (!gameState || !playerId) return;
    console.log(typeof gameState.gameId);
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/rules/game/${gameState.gameId}/player/${playerId}/hit`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors du Hit');
      }

      const data = await response.json();
      const round = data.data;

      if (round.result) {
        setPlayerHand(round.result.hand);
        setPlayerScore(round.result.score);

        if (round.result.isBusted) {
          setMessage('💥 BUST ! Vous avez dépassé 21 !');
          await endGame();
        }
      }

      setLoading(false);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleStand = async () => {
    if (!gameState || !playerId) return;

    try {
      setLoading(true);
      
      // Player stand
      await fetch(`${API_URL}/rules/game/${gameState.gameId}/player/${playerId}/stand`, {
        method: 'POST',
      });

      // Jouer le tour du croupier et des bots
      await fetch(`${API_URL}/rules/game/${gameState.gameId}/auto-play`, {
        method: 'POST',
      });

      // Terminer la partie
      await endGame();
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const endGame = async () => {
    if (!gameState) return;

    try {
      const response = await fetch(`${API_URL}/rules/game/${gameState.gameId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: gameState.startTime
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la fin de partie');
      }

      const data = await response.json();
      
      // Récupérer l'état final du jeu
      const stateResponse = await fetch(`${API_URL}/rules/game/${gameState.gameId}/state`);
      const stateData = await stateResponse.json();
      console.log("stateData: ", stateData.data);
      
      // Trouver le dernier round du croupier (avec toutes les cartes)
      const dealerRounds = stateData.data.rounds.filter((r: any) => r.type === 'DEALER');
      const lastDealerRound = dealerRounds[dealerRounds.length - 1];
      console.log("Last dealer round:", lastDealerRound);
      if (lastDealerRound && lastDealerRound.result) {
        console.log("Setting dealer hand:", lastDealerRound.result.hand);
        console.log("Setting dealer score:", lastDealerRound.result.score);
        setDealerHand(lastDealerRound.result.hand);
        setDealerScore(lastDealerRound.result.score);
      }

      // Mettre à jour les bots avec leur état final (dernier round de chaque bot)
      const allBotRounds = stateData.data.rounds.filter((r: any) => r.type === 'BOT');
      const botMap = new Map();
      allBotRounds.forEach((bot: any) => {
        botMap.set(bot.id, bot); // Garde le dernier round de chaque bot
      });
      const finalBotRounds = Array.from(botMap.values());
      setBotRounds(finalBotRounds);

      // Afficher le message de victoire/défaite
      if (data.data.winnerId === playerId) {
        setMessage('🎉 VICTOIRE ! Vous avez gagné !');
      } else if (data.data.winnerId === '-1') {
        setMessage('😞 Le croupier a gagné !');
      } else if (finalBotRounds.some((bot: any) => bot.id === data.data.winnerId)) {
        const winner = finalBotRounds.find((bot: any) => bot.id === data.data.winnerId);
        setMessage(`🤖 ${winner?.name || 'Un bot'} a gagné !`);
      } else {
        setMessage('🤝 Égalité !');
      }

      setGameOver(true);
      setLoading(false);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const resetGame = () => {
    setGameState(null);
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerScore(0);
    setDealerScore(0);
    setBotRounds([]);
    setGameOver(false);
    setMessage('');
    setShowBetModal(true);
  };

  if (loading && !showBetModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-black flex items-center justify-center">
        <div className="text-yellow-400 text-2xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-black p-4">
      {/* Bet Modal */}
      {showBetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border-4 border-yellow-600">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
              Placez votre mise
            </h2>
            
            <div className="mb-6">
              <label className="block text-yellow-200 font-semibold mb-2">
                Mise: {entryBlind} jetons
              </label>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={entryBlind}
                onChange={(e) => setEntryBlind(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={createGame}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-green-900 font-bold py-4 px-6 rounded-lg shadow-lg transform transition hover:scale-105 text-lg disabled:opacity-50"
            >
              {loading ? 'Création...' : '🎲 Distribuer les cartes'}
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full mt-4 text-yellow-300 hover:text-yellow-100 underline"
            >
              ← Retour
            </button>
          </div>
        </div>
      )}

      {/* Game Board */}
      {!showBetModal && (
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">🃏 Blackjack</h1>
            <p className="text-yellow-200">Mise: {entryBlind} jetons</p>
          </div>

          {/* Dealer's Hand */}
          <div className="mb-12 bg-green-700 bg-opacity-50 rounded-xl p-6 border-2 border-yellow-600">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">
              🎩 Croupier - Score: {dealerScore}{!gameOver && ' (1 carte visible)'}
            </h2>
            <div className="flex gap-2 flex-wrap justify-center">
              {dealerHand.map((card, index) => (
                <Card key={index} card={card} />
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-yellow-300 bg-green-700 bg-opacity-50 py-4 px-6 rounded-lg border-2 border-yellow-600">
              {message}
            </p>
          </div>

          {/* Bots (Tournament Mode) */}
          {botRounds.length > 0 && (
            <div className="mb-8 bg-green-700 bg-opacity-50 rounded-xl p-6 border-2 border-yellow-600">
              <h2 className="text-2xl font-bold text-yellow-300 mb-4">
                🤖 Bots ({botRounds.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {botRounds.map((bot, index) => (
                  <div key={bot.id} className="bg-green-800 bg-opacity-50 rounded-lg p-4 border border-yellow-500">
                    <h3 className="text-yellow-200 font-semibold mb-2">
                      🤖 {bot.name || `Bot ${index + 1}`}
                      {bot.result && ` - Score: ${bot.result.score}`}
                      {bot.result?.isBusted && ' 💥'}
                    </h3>
                    <div className="flex gap-1 flex-wrap">
                      {bot.result?.hand.map((card, cardIndex) => (
                        <div key={cardIndex} className="text-2xl">
                          {card}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player's Hand */}
          <div className="mb-8 bg-green-700 bg-opacity-50 rounded-xl p-6 border-2 border-yellow-600">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">
              👤 Vous - Score: {playerScore}
            </h2>
            <div className="flex gap-2 flex-wrap justify-center">
              {playerHand.map((card, index) => (
                <Card key={index} card={card} />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            {!gameOver && (
              <>
                <button
                  onClick={handleHit}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform transition hover:scale-105 text-lg disabled:opacity-50"
                >
                  🃏 Hit
                </button>
                <button
                  onClick={handleStand}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform transition hover:scale-105 text-lg disabled:opacity-50"
                >
                  ✋ Stand
                </button>
              </>
            )}
            
            {gameOver && (
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-green-900 font-bold py-4 px-8 rounded-lg shadow-lg transform transition hover:scale-105 text-lg"
              >
                🔄 Nouvelle partie
              </button>
            )}
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/')}
              className="text-yellow-300 hover:text-yellow-100 underline"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
