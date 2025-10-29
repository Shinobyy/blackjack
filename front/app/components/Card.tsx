import { getCardDisplay } from '../utils/cards';

interface CardProps {
  card: string;
}

export default function Card({ card }: CardProps) {
  const { value, suit, color } = getCardDisplay(card);
  
  const isHidden = card === '🂠';

  return (
    <div className={`
      relative w-20 h-28 rounded-lg shadow-xl
      ${isHidden ? 'bg-gradient-to-br from-blue-800 to-blue-900' : 'bg-white'}
      border-2 border-gray-300
      flex flex-col items-center justify-between
      p-2
      transform transition-all hover:scale-105
    `}>
      {isHidden ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-4xl text-blue-400">🂠</div>
        </div>
      ) : (
        <>
          {/* Top value */}
          <div className={`
            text-left w-full font-bold text-lg
            ${color === 'red' ? 'text-red-600' : 'text-black'}
          `}>
            <div>{value}</div>
            <div className="text-2xl leading-none">{suit}</div>
          </div>

          {/* Center suit */}
          <div className={`
            text-4xl
            ${color === 'red' ? 'text-red-600' : 'text-black'}
          `}>
            {suit}
          </div>

          {/* Bottom value (rotated) */}
          <div className={`
            text-right w-full font-bold text-lg transform rotate-180
            ${color === 'red' ? 'text-red-600' : 'text-black'}
          `}>
            <div>{value}</div>
            <div className="text-2xl leading-none">{suit}</div>
          </div>
        </>
      )}
    </div>
  );
}
