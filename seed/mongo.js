// Connexion avec les credentials admin
db = db.getSiblingDB('blackjack');

// ========================================
// COLLECTION: games
// ========================================
db.games.insertMany([
  {
    "_id": ObjectId(),  // Auto-généré si non spécifié
    "tournamentId": "550e8400-e29b-41d4-a716-446655440000",  // Exemple d'UUID pour référence à un tournoi
    "timestamp": ISODate("2025-10-28T20:10:00Z"),
    "rounds": [
      {
        "id": "4564257-uuid-1",  // Changé en chaîne (UUID-like)
        "type": "PLAYER",
        "initialHand": ["K♣", "7♦"],
        "action": "HIT",
        "turn": 0,
        "result": {
          "hand": ["K♣", "7♦", "2♦"],
          "score": 19,
          "isBusted": false
        }
      },
      {
        "id": "8159565-uuid-2",
        "type": "BOT",
        "initialHand": ["9♣", "6♣"],
        "action": "HIT",
        "turn": 1,
        "result": {
          "hand": ["9♣", "6♣", "8♦"],
          "score": 23,
          "isBusted": true
        }
      },
      {
        "id": "-1-uuid-dealer",
        "type": "DEALER",
        "initialHand": ["9♣", "6♣"],  // Ajouté pour cohérence
        "action": null,
        "turn": null,
        "result": {
          "hand": ["9♣", "6♣", "6♦"],
          "score": 21,
          "isBusted": false
        }
      },
      {
        "id": "4564257-uuid-1",
        "type": "PLAYER",
        "initialHand": ["K♣", "7♦", "2♦"],
        "action": "HIT",
        "turn": 0,
        "result": {
          "hand": ["K♣", "7♦", "2♦", "6♣"],
          "score": 25,
          "isBusted": true
        }
      }
    ],
    "winnerId": "-1-uuid-dealer",  // Chaîne pour le dealer
    "metadata": {
      "durationSeconds": 42
    }
  },
  // Exemple supplémentaire d'une partie gagnée par le joueur
  {
    "_id": ObjectId(),
    "tournamentId": "550e8400-e29b-41d4-a716-446655440001",
    "timestamp": ISODate("2025-10-29T15:30:00Z"),
    "rounds": [
      {
        "id": "1234567-uuid-player",
        "type": "PLAYER",
        "initialHand": ["A♠", "10♥"],
        "action": "STAND",
        "turn": 0,
        "result": {
          "hand": ["A♠", "10♥"],
          "score": 21,
          "isBusted": false
        }
      },
      {
        "id": "9876543-uuid-bot",
        "type": "BOT",
        "initialHand": ["5♦", "8♣"],
        "action": "HIT",
        "turn": 1,
        "result": {
          "hand": ["5♦", "8♣", "K♠"],
          "score": 23,
          "isBusted": true
        }
      },
      {
        "id": "-1-uuid-dealer",
        "type": "DEALER",
        "initialHand": ["7♣", "9♦"],
        "action": null,
        "turn": null,
        "result": {
          "hand": ["7♣", "9♦"],
          "score": 16,
          "isBusted": false
        }
      }
    ],
    "winnerId": "1234567-uuid-player",
    "metadata": {
      "durationSeconds": 35
    }
  }
]);

print("Seeder MongoDB terminé : exemples de parties insérés.");