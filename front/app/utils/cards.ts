// Utilitaires pour les cartes

export const getCardDisplay = (card: string): { value: string; suit: string; color: string } => {
  if (card === '🂠') {
    return { value: '?', suit: '🂠', color: 'gray' };
  }

  // Extraire la valeur et la couleur
  const suit = card.slice(-1);
  const value = card.slice(0, -1);

  // Déterminer la couleur (rouge ou noir)
  const redSuits = ['♥', '♦'];
  const color = redSuits.includes(suit) ? 'red' : 'black';

  return { value, suit, color };
};

export const cardSymbols: { [key: string]: string } = {
  '♣': '♣',
  '♦': '♦',
  '♥': '♥',
  '♠': '♠',
};

// Convertir les valeurs de cartes en texte
export const getCardValueText = (value: string): string => {
  const values: { [key: string]: string } = {
    'A': 'A',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    'J': 'V',
    'Q': 'D',
    'K': 'R',
  };

  return values[value] || value;
};
