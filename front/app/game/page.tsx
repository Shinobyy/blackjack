'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import { calculateHandScore } from '../utils/cards';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          className="text-[#00ff41] text-2xl neon-text"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Chargement...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden p-2">
      {/* Ambiance tamisée avec lumières vertes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 left-1/4 w-96 h-96 bg-[#00ff41] rounded-full blur-[150px] opacity-10"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#00ff41] rounded-full blur-[150px] opacity-10"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5
          }}
        />
      </div>

      {/* Bet Modal */}
      <AnimatePresence>
        {showBetModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-2xl p-8 max-w-md w-full border border-[#00ff41] border-opacity-30"
              style={{
                boxShadow: '0 0 30px rgba(0, 255, 65, 0.2), inset 0 0 30px rgba(0, 255, 65, 0.05)'
              }}
            >
              <h2 className="text-3xl font-bold text-[#00ff41] mb-6 text-center neon-text uppercase tracking-wider">
                Placez votre mise
              </h2>
              
              <div className="mb-6">
                <label className="block text-[#00ff41] font-semibold mb-3 text-sm uppercase tracking-wide">
                  › Mise: {entryBlind} jetons
                </label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={entryBlind}
                  onChange={(e) => setEntryBlind(parseInt(e.target.value))}
                  className="w-full accent-[#00ff41]"
                />
              </div>

              <motion.button
                type="button"
                onClick={createGame}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#00ff41] hover:bg-[#00cc33] text-black font-bold py-4 px-6 rounded-lg transition-all text-lg disabled:opacity-50 uppercase tracking-wider"
                style={{
                  boxShadow: '0 0 20px rgba(0, 255, 65, 0.4)'
                }}
              >
                {loading ? 'CRÉATION...' : '► DISTRIBUER LES CARTES'}
              </motion.button>

              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full mt-4 text-[#00cc33] hover:text-[#00ff41] transition-colors"
              >
                ← Retour
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Board */}
      {!showBetModal && (
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <motion.div 
            className="text-center mb-4"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-3xl font-bold text-[#00ff41] mb-1 neon-text">♠ BLACKJACK ♥</h1>
            <p className="text-[#00cc33] uppercase tracking-wider text-sm">Mise: {entryBlind} jetons</p>
          </motion.div>

          {/* Dealer's Hand */}
          <motion.div 
            className="mb-4 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-xl p-4 border border-[#00ff41] border-opacity-20"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              boxShadow: 'inset 0 0 20px rgba(0, 255, 65, 0.05), 0 0 20px rgba(0, 255, 65, 0.1)'
            }}
          >
            <h2 className="text-lg font-bold text-[#00ff41] mb-3 uppercase tracking-wide">
              🎩 Croupier • Score: {dealerScore}{!gameOver && ' (1 carte visible)'}
            </h2>
            <div className="flex gap-2 flex-wrap justify-center">
              {dealerHand.map((card, index) => (
                <Card key={index} card={card} delay={index * 0.1} />
              ))}
            </div>
          </motion.div>

          {/* Message */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={message}
              className="text-center mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <p className="text-lg font-bold text-[#00ff41] bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] py-2 px-4 rounded-lg border border-[#00ff41] border-opacity-30 inline-block neon-text uppercase tracking-wide">
                {message}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Bots (Tournament Mode) */}
          {botRounds.length > 0 && (
            <motion.div 
              className="mb-4 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-xl p-4 border border-[#00ff41] border-opacity-20"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                boxShadow: 'inset 0 0 20px rgba(0, 255, 65, 0.05), 0 0 20px rgba(0, 255, 65, 0.1)'
              }}
            >
              <h2 className="text-lg font-bold text-[#00ff41] mb-3 uppercase tracking-wide">
                🤖 Adversaires IA ({botRounds.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {botRounds.map((bot, index) => (
                  <motion.div 
                    key={bot.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-black bg-opacity-60 rounded-lg p-3 border border-[#00ff41] border-opacity-20"
                    style={{
                      boxShadow: 'inset 0 0 15px rgba(0, 255, 65, 0.05)'
                    }}
                  >
                    <h3 className="text-[#00ff41] font-semibold mb-2 uppercase text-xs tracking-wide">
                      › {bot.name || `Bot ${index + 1}`}
                      {bot.result && ` • Score: ${bot.result.score}`}
                      {bot.result?.isBusted && ' 💥'}
                    </h3>
                    <div className="flex gap-1 flex-wrap justify-center">
                      {bot.result?.hand.map((card, cardIndex) => (
                        <Card key={cardIndex} card={card} delay={cardIndex * 0.05} />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Player's Hand */}
          <motion.div 
            className="mb-4 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-xl p-4 border border-[#00ff41] border-opacity-30"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              boxShadow: 'inset 0 0 20px rgba(0, 255, 65, 0.1), 0 0 30px rgba(0, 255, 65, 0.2)'
            }}
          >
            <h2 className="text-lg font-bold text-[#00ff41] mb-3 uppercase tracking-wide">
              👤 Vous • Score: {playerScore}
            </h2>
            <div className="flex gap-2 flex-wrap justify-center">
              {playerHand.map((card, index) => (
                <Card key={index} card={card} delay={index * 0.1} />
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div 
            className="flex gap-3 justify-center flex-wrap"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {!gameOver && (
              <>
                <motion.button
                  type="button"
                  onClick={handleHit}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#00ff41] hover:bg-[#00cc33] text-black font-bold py-3 px-8 rounded-lg transition-all text-base disabled:opacity-50 uppercase tracking-wider"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 255, 65, 0.4)'
                  }}
                >
                  ► HIT
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleStand}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-black border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black font-bold py-3 px-8 rounded-lg transition-all text-base disabled:opacity-50 uppercase tracking-wider"
                  style={{
                    boxShadow: '0 0 15px rgba(0, 255, 65, 0.3)'
                  }}
                >
                  ✋ STAND
                </motion.button>
              </>
            )}
            
            {gameOver && (
              <motion.button
                type="button"
                onClick={resetGame}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#00ff41] hover:bg-[#00cc33] text-black font-bold py-3 px-8 rounded-lg transition-all text-base uppercase tracking-wider"
                style={{
                  boxShadow: '0 0 30px rgba(0, 255, 65, 0.5)'
                }}
              >
                🔄 NOUVELLE PARTIE
              </motion.button>
            )}
          </motion.div>

          {/* Back to Home */}
          <motion.div 
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-[#00cc33] hover:text-[#00ff41] transition-colors uppercase text-xs tracking-wider"
            >
              ← Retour à l'accueil
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
