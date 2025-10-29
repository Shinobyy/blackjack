'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RankingItem {
  user: { id: string; username: string };
  totalGains: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Leaderboard() {
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/analytics/ranking`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du classement');
      }
      
      const data = await response.json();
      setRankings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur lors du chargement du classement:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}.`;
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-2xl p-6 border border-[#00ff41] border-opacity-30">
        <h2 className="text-2xl font-bold text-[#00ff41] mb-4 text-center">
          🏆 CLASSEMENT
        </h2>
        <div className="text-center text-[#00cc33] py-8">
          Chargement...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-2xl p-6 border border-[#00ff41] border-opacity-30">
        <h2 className="text-2xl font-bold text-[#00ff41] mb-4 text-center">
          🏆 CLASSEMENT
        </h2>
        <div className="text-center text-red-400 py-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-2xl p-6 border border-[#00ff41] border-opacity-30"
      style={{
        boxShadow: '0 0 30px rgba(0, 255, 65, 0.2), inset 0 0 30px rgba(0, 255, 65, 0.05)'
      }}
    >
      <h2 className="text-2xl font-bold text-[#00ff41] mb-4 text-center neon-text">
        🏆 CLASSEMENT
      </h2>
      
      {rankings.length === 0 ? (
        <div className="text-center text-[#00cc33] py-4">
          Aucun joueur classé pour le moment
        </div>
      ) : (
        <div className="space-y-2">
          {rankings.map((item, index) => (
            <motion.div
              key={item.user.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg bg-black bg-opacity-40 border border-[#00ff41] border-opacity-20 hover:border-opacity-40 transition-all ${
                index < 3 ? 'border-[#00ff41]' : 'border-[#00cc33]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`text-lg font-bold ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-gray-300' :
                  index === 2 ? 'text-orange-400' :
                  'text-[#00cc33]'
                }`}>
                  {getRankIcon(index)}
                </span>
                <span className="text-[#00ff41] font-semibold">
                  {item.user.username}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[#00cc33] font-mono">
                  {item.totalGains.toLocaleString()}
                </span>
                <span className="text-[#00cc33] opacity-60 text-sm">pts</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
