'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Leaderboard from './components/Leaderboard';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [gameMode, setGameMode] = useState<'1v1' | 'tournament'>('1v1');
  const [numberOfBots, setNumberOfBots] = useState(3);

  // Gérer automatiquement la session ID au chargement
  useEffect(() => {
    let storedSessionId = localStorage.getItem('blackjack_sessionId');
    
    if (!storedSessionId) {
      // Créer une nouvelle session ID si elle n'existe pas
      storedSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('blackjack_sessionId', storedSessionId);
    }
    
    setSessionId(storedSessionId);
  }, []);

  const handleStartGame = () => {
    if (!username) {
      alert('Veuillez entrer votre nom');
      return;
    }

    // Stocker les infos dans localStorage
    localStorage.setItem('blackjack_username', username);
    localStorage.setItem('blackjack_gameMode', gameMode);
    localStorage.setItem('blackjack_numberOfBots', numberOfBots.toString());

    // Rediriger vers la page de jeu
    router.push('/game');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4 gap-8">
      {/* Effet d'ambiance tamisée - cercles de lumière verte */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-[#00ff41] rounded-full blur-[150px] opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#00ff41] rounded-full blur-[150px] opacity-10"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Conteneur principal avec formulaire et leaderboard */}
      <div className="relative flex flex-col lg:flex-row items-start justify-center gap-8 w-full max-w-6xl z-10">
        
        {/* Formulaire de démarrage */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-2xl p-8 max-w-md w-full border border-[#00ff41] border-opacity-30"
          style={{
            boxShadow: '0 0 30px rgba(0, 255, 65, 0.2), inset 0 0 30px rgba(0, 255, 65, 0.05)'
          }}
        >
        <motion.h1 
          className="text-5xl font-bold text-center mb-2 text-[#00ff41] neon-text"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          ♠ BLACKJACK ♥
        </motion.h1>
        <motion.p 
          className="text-center text-[#00cc33] mb-8 text-sm tracking-wider uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Casino Virtuel • Ambiance Tamisée
        </motion.p>

        {sessionId && (
          <motion.div 
            className="mb-6 text-center text-xs text-[#00cc33] bg-black bg-opacity-50 py-2 px-4 rounded border border-[#00ff41] border-opacity-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="opacity-60">Session active:</span> <span className="font-mono">{sessionId.substring(0, 20)}...</span>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Username */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-[#00ff41] font-semibold mb-2 text-sm uppercase tracking-wide">
              › Nom du joueur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez votre nom"
              className="w-full px-4 py-3 rounded-lg bg-black border border-[#00ff41] border-opacity-30 text-[#00ff41] placeholder-[#00ff41] placeholder-opacity-40 focus:outline-none focus:border-[#00ff41] focus:border-opacity-70 transition-all"
              style={{
                boxShadow: 'inset 0 0 10px rgba(0, 255, 65, 0.1)'
              }}
            />
          </motion.div>

          {/* Game Mode */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-[#00ff41] font-semibold mb-2 text-sm uppercase tracking-wide">
              › Mode de jeu
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  value="1v1"
                  checked={gameMode === '1v1'}
                  onChange={(e) => setGameMode(e.target.value as '1v1')}
                  className="w-4 h-4 accent-[#00ff41]"
                />
                <span className="text-[#00cc33] group-hover:text-[#00ff41] transition-colors">1 vs 1 (Vous vs Croupier)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  value="tournament"
                  checked={gameMode === 'tournament'}
                  onChange={(e) => setGameMode(e.target.value as 'tournament')}
                  className="w-4 h-4 accent-[#00ff41]"
                />
                <span className="text-[#00cc33] group-hover:text-[#00ff41] transition-colors">Tournoi (Vous + Bots vs Croupier)</span>
              </label>
            </div>
          </motion.div>

          {/* Number of Bots */}
          {gameMode === 'tournament' && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-[#00ff41] font-semibold mb-2 text-sm uppercase tracking-wide">
                › Nombre de bots: {numberOfBots}
              </label>
              <input
                type="range"
                min="1"
                max="3"
                value={numberOfBots}
                onChange={(e) => setNumberOfBots(parseInt(e.target.value))}
                className="w-full accent-[#00ff41]"
              />
              <p className="text-[#00cc33] text-sm mt-1">Maximum: 3 bots</p>
            </motion.div>
          )}

          {/* Start Button */}
          <motion.button
            type="button"
            onClick={handleStartGame}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="w-full bg-[#00ff41] hover:bg-[#00cc33] text-black font-bold py-4 px-6 rounded-lg transition-all text-lg uppercase tracking-wider"
            style={{
              boxShadow: '0 0 20px rgba(0, 255, 65, 0.4)'
            }}
          >
            ► Démarrer la partie
          </motion.button>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <div className="w-full max-w-md">
        <Leaderboard />
      </div>

    </div>
    </div>
  );
}
