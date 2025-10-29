# 🃏 Blackjack - Frontend Next.js

Application web de Blackjack développée avec Next.js 15 et TypeScript, connectée à l'API backend.

## 🚀 Installation

```bash
cd front
npm install
```

## ▶️ Démarrage

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3001`

## 🎮 Fonctionnalités

### Page d'accueil (`/`)
- Saisie du nom d'utilisateur
- Génération automatique de Session ID
- Choix du mode de jeu :
  - **1v1** : Vous contre le croupier
  - **Tournoi** : Vous + bots contre le croupier
- Sélection du nombre de bots (1-10) en mode tournoi

### Page de jeu (`/game`)
- Placement de la mise (10-1000 jetons)
- Affichage des cartes :
  - Main du croupier (2ème carte cachée)
  - Main du joueur avec score
- Actions disponibles :
  - **Hit** : Piocher une carte
  - **Stand** : Rester avec sa main actuelle
- Messages en temps réel :
  - Score actuel
  - Bust (dépassement de 21)
  - Victoire/Défaite
- Possibilité de rejouer

## 🎨 Design

- **Couleurs** : Thème casino vert et or
- **Responsive** : Adapté mobile et desktop
- **Animations** : Effets de survol et transitions
- **Émojis** : Interface ludique avec émojis de cartes

## 🔌 API

L'application se connecte à l'API backend sur `http://localhost:3000`

### Endpoints utilisés :

- `POST /rules/game/1v1` - Créer partie 1v1
- `POST /rules/game/tournament` - Créer tournoi
- `POST /rules/game/:gameId/player/:playerId/hit` - Piocher
- `POST /rules/game/:gameId/player/:playerId/stand` - Rester
- `POST /rules/game/:gameId/auto-play` - Jouer bots + croupier
- `POST /rules/game/:gameId/end` - Terminer la partie
- `GET /rules/game/:gameId/state` - État du jeu

## 📝 Notes

- L'utilisateur est créé automatiquement lors de la création de la partie
- Solde initial : 15,000 jetons
- Les cartes sont affichées avec leurs symboles Unicode
- La 2ème carte du croupier est cachée jusqu'à la fin

## 🛠️ Configuration CORS

Si vous avez des problèmes CORS, ajoutez ceci dans votre API Express :

```javascript
import cors from 'cors';
app.use(cors());
```

## 🎯 TODO

- [ ] Afficher les statistiques de la partie
- [ ] Historique des parties
- [ ] Classement des joueurs
- [ ] Son et musique
- [ ] Animation des cartes
- [ ] Mode multijoueur en temps réel
