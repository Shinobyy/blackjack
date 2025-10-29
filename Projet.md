A faire : 


Setup Docker : 

    - DB:
        - Postgres
        - Mongo
        (penser aux seeds)


Principe :

- BlackJack

Tables :

Un user -> Plusieurs parties
Les parties -> Sont associées à un tournoi
Une partie -> Un joueur
Une partie -> Plusieurs bots

Une partie -> Un tournois

# Postgres :

TABLES

User
id
session_id
username
max_profit: 15000
created_at
updated_at


Bots
(copie la mise de l'entry_blind)
id
username
created_at
updated_at


Tournois
id
user_id
active: boolean
created_at
updated_at


User<-Tournois->Parties

MongoDB:

Parties

{
  "_id": ObjectId("..."),
  "tournament_id": 123, 
  "timestamp": ISODate("2025-10-28T20:10:00Z"),
  "rounds": [
    {
      "id": 4564257,
      "type": "player",
      "initial_hand": ["K♣", "7♦"],
      "action": "hit",
      "score": 17
      "turn": 0,
      "result": {
        "hand": ["K♣", "7♦", "2♦"],
        "score": 19,
        "isBusted": false  
      }
    },
    {
      "id": 8159565,
      "type": "bot",
      "initial_hand": ["9♣", "6♣"],
      "action": "hit",
      "score": 15,
      "turn": 1,
      "result": {
        "hand": ["9♣", "6♣", "8♦"],
        "score": 23,
        "isBusted": true  
      }
    },
    {
      "id": -1,
      "type": "dealer",
      "hand": ["9♣", "6♣", "6♦"],
      "score": 21,
      "result": {
          "hand": ["9♣", "6♣", "6♦"],
          "score": 21,
          "isBusted": false
      }
    },
    {
      "id": 4564257,
      "type": "player",
      "initial_hand": ["K♣", "7♦", "2♦"],
      "action": "hit",
      "score": 19,
      "turn": 0,
      "result": {
        "hand": ["K♣", "7♦", "2♦" "6♣"],
        "score": 25,
        "isBusted": true
        }  
    }
  ],
  "winner_id": -1,
  "metadata": {
    "duration_seconds": 42
  }
}


### 7. Logique Utilisateur

#### a. Inscription et Connexion
- **Inscription** : L'utilisateur est créé lorsque la partie commence. Les informations de l'utilisateur (session_id, username, max_profit) sont stockées dans PostgreSQL.
- **Connexion** : L'utilisateur récupère ses données via `GET /users/session/{sessionId}` ou `GET /users/{id}`. La session est gérée côté client.

#### b. Création d'une Partie
- **Choix du Mode** :
  - **1v1 (Utilisateur vs Croupier)** : Mode simple, sans bots. L'utilisateur choisit une mise (entry_blind), et un tournoi temporaire est créé dans PostgreSQL avec `user_id` et `active = true`.
  - **Tournoi (Utilisateur + Bots vs Croupier)** : Mode avancé. L'utilisateur choisit une mise, puis un tournoi est créé dans PostgreSQL. Des bots sont générés automatiquement (ex. 3 bots) dans PostgreSQL, avec des usernames aléatoires.
- **Création en Base** :
  - Tournoi : `POST /tournaments` avec `user_id` et `active = true`.
  - Partie : `POST /games` avec `tournamentId` (référence au tournoi), `timestamp`, `rounds` (initialement vide), `winnerId` (null), `metadata` (avec `durationSeconds` à 0).
  - Les données sont stockées : tournoi/bots en PostgreSQL, partie en MongoDB.

#### c. Déroulement d'une Partie
- **Initialisation** :
  - Distribution des cartes : Le croupier (dealer) et le joueur (user) reçoivent 2 cartes chacun. Les bots (si tournoi) reçoivent aussi 2 cartes.
  - Les cartes sont représentées par des chaînes (ex. "K♣", "7♦") dans `initialHand` des rounds.
- **Tours de Jeu** :
  - **Tour du Joueur** : L'utilisateur choisit "hit" (piocher) ou "stand" (rester). Mise à jour du round dans MongoDB via `PUT /games/{id}`.
  - **Tours des Bots** (si tournoi) : Logique automatique (ex. hit si score < 17, stand sinon). Mise à jour des rounds.
  - **Tour du Croupier** : Logique fixe (hit jusqu'à 17, stand après). Le croupier est représenté par `winnerId = -1` ou un ID spécial.
  - Chaque action met à jour `rounds` avec `id` (UUID), `type` ("PLAYER", "BOT", "DEALER"), `action`, `turn`, `result` (hand, score, isBusted).
- **Calcul des Scores** :
  - Score = somme des valeurs des cartes (A=1 ou 11, figures=10).
  - Bust si score > 21.
  - Victoire : score le plus proche de 21 sans bust, ou blackjack (21 avec 2 cartes).
- **Fin de Partie** :
  - Détermination du gagnant : Comparaison des scores. Mise à jour de `winnerId` et `metadata.durationSeconds`.
  - Mise à jour des profits : Si gagnant, ajouter la mise au `max_profit` de l'utilisateur via `PUT /users/{id}`.
  - Tournoi terminé : Mettre `active = false` via `PUT /tournaments/{id}`.

#### d. Consultation des Données
- **Historique** : `GET /games` pour lister les parties, `GET /games/{id}` pour une partie spécifique.
- **Statistiques** : `GET /analytics/ranking` (classement par gains), `GET /analytics/top-active` (joueurs actifs), `GET /analytics/best-win-rate` (meilleur taux de victoire).
- **Gestion des Entités** : CRUD complet pour users, bots, tournaments via les endpoints correspondants.

#### e. Gestion des Erreurs et Sécurité
- Validation des entrées (ex. mise <= max_profit).
- Gestion des sessions pour éviter les accès non autorisés.
- Logs des actions pour audit.

Cette logique assure une expérience fluide, avec une séparation claire des responsabilités (PostgreSQL pour la persistance statique, MongoDB pour les données volatiles). Les requêtes complexes (agrégations) sont optimisées via les services Analytics.