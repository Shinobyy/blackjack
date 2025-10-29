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

// Calculer le score d'une carte
export const getCardScore = (card: string): number => {
  if (card === '🂠') return 0;
  
  const value = card.slice(0, -1);
  
  // Les figures valent 10
  if (['J', 'Q', 'K'].includes(value)) return 10;
  
  // L'As peut valoir 1 ou 11, on retourne 11 par défaut
  if (value === 'A') return 11;
  
  // Les cartes numériques valent leur valeur
  return parseInt(value) || 0;
};

// Calculer le score d'une main (avec gestion des As)
export const calculateHandScore = (hand: string[]): number => {
  let score = 0;
  let aces = 0;
  
  hand.forEach(card => {
    if (card === '🂠') return; // Ignorer les cartes cachées
    
    const value = card.slice(0, -1);
    
    if (value === 'A') {
      aces++;
      score += 11;
    } else if (['J', 'Q', 'K'].includes(value)) {
      score += 10;
    } else {
      score += parseInt(value) || 0;
    }
  });
  
  // Ajuster pour les As si nécessaire
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
};
