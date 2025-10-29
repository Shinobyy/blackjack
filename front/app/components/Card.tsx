'use client';

import { motion } from 'framer-motion';
import { getCardDisplay } from '../utils/cards';

interface CardProps {
  card: string;
  delay?: number;
}

// Fonction pour mapper les cartes au format SVG
const getCardImagePath = (card: string): string | null => {
  if (card === '🂠') return '/cards/BACK.svg';
  
  const { value, suit } = getCardDisplay(card);
  
  // Mapping des couleurs
  const suitMap: { [key: string]: string } = {
    '♠': 'SPADE',
    '♥': 'HEART',
    '♦': 'DIAMOND',
    '♣': 'CLUB'
  };
  
  const suitName = suitMap[suit];
  if (!suitName) return null;
  
  // Mapping des valeurs
  const valueMap: { [key: string]: string } = {
    'A': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    'J': '11-JACK',
    'Q': '12-QUEEN',
    'K': '13-KING'
  };
  
  const valueName = valueMap[value];
  if (!valueName) return null;
  
  return `/cards/${suitName}-${valueName}.svg`;
};

export default function Card({ card, delay = 0 }: CardProps) {
  const imagePath = getCardImagePath(card);
  const isHidden = card === '🂠';

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: -100,
        rotateY: 180 
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        rotateY: 0
      }}
      transition={{ 
        duration: 0.6,
        delay: delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.1,
        rotateZ: 5,
        transition: { duration: 0.2 }
      }}
      className={`
        relative w-16 h-24 rounded-lg
        cursor-pointer
        transform-gpu
        ${isHidden ? 'animate-pulse' : ''}
      `}
      style={{
        filter: 'drop-shadow(0 0 8px rgba(0, 255, 65, 0.4))',
        transformStyle: 'preserve-3d'
      }}
    >
      {imagePath ? (
        <img 
          src={imagePath} 
          alt={card}
          className="w-full h-full object-contain rounded-lg"
          style={{
            filter: isHidden 
              ? 'brightness(0.7) drop-shadow(0 0 10px rgba(0, 255, 65, 0.6))' 
              : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))'
          }}
        />
      ) : (
        <div className="w-full h-full bg-white rounded-lg flex items-center justify-center text-4xl">
          {card}
        </div>
      )}
    </motion.div>
  );
}
