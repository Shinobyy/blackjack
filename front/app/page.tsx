'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [gameMode, setGameMode] = useState<'1v1' | 'tournament'>('1v1');
  const [numberOfBots, setNumberOfBots] = useState(3);

  const handleStartGame = () => {
    if (!username || !sessionId) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    // Stocker les infos dans localStorage
    localStorage.setItem('blackjack_username', username);
    localStorage.setItem('blackjack_sessionId', sessionId);
    localStorage.setItem('blackjack_gameMode', gameMode);
    localStorage.setItem('blackjack_numberOfBots', numberOfBots.toString());

    // Rediriger vers la page de jeu
    router.push('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-black flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border-4 border-yellow-600">
        <h1 className="text-4xl font-bold text-center mb-2 text-yellow-400 drop-shadow-lg">
          🃏 Blackjack
        </h1>
        <p className="text-center text-yellow-200 mb-8">Bienvenue au casino !</p>

        <div className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-yellow-200 font-semibold mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez votre nom"
              className="w-full px-4 py-3 rounded-lg bg-green-800 border-2 border-yellow-600 text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Session ID */}
          <div>
            <label className="block text-yellow-200 font-semibold mb-2">
              Session ID
            </label>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="ID de session unique"
              className="w-full px-4 py-3 rounded-lg bg-green-800 border-2 border-yellow-600 text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              onClick={() => setSessionId(`sess_${Date.now()}`)}
              className="mt-2 text-sm text-yellow-300 hover:text-yellow-100 underline"
            >
              Générer un ID automatique
            </button>
          </div>

          {/* Game Mode */}
          <div>
            <label className="block text-yellow-200 font-semibold mb-2">
              Mode de jeu
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value="1v1"
                  checked={gameMode === '1v1'}
                  onChange={(e) => setGameMode(e.target.value as '1v1')}
                  className="w-5 h-5 text-yellow-400"
                />
                <span className="text-white">1 vs 1 (Vous vs Croupier)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value="tournament"
                  checked={gameMode === 'tournament'}
                  onChange={(e) => setGameMode(e.target.value as 'tournament')}
                  className="w-5 h-5 text-yellow-400"
                />
                <span className="text-white">Tournoi (Vous + Bots vs Croupier)</span>
              </label>
            </div>
          </div>

          {/* Number of Bots */}
          {gameMode === 'tournament' && (
            <div>
              <label className="block text-yellow-200 font-semibold mb-2">
                Nombre de bots: {numberOfBots}
              </label>
              <input
                type="range"
                min="1"
                max="3"
                value={numberOfBots}
                onChange={(e) => setNumberOfBots(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-yellow-300 text-sm mt-1">Maximum: 3 bots</p>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-green-900 font-bold py-4 px-6 rounded-lg shadow-lg transform transition hover:scale-105 text-lg"
          >
            🎲 Commencer la partie
          </button>
        </div>

        <div className="mt-6 text-center text-yellow-200 text-sm">
          <p>💰 Solde initial: 15,000 jetons</p>
        </div>
      </div>
    </div>
  );
}
