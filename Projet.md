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

