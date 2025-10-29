# 🎲 Scripts de développement Blackjack

## 📋 Scripts disponibles

### 1. `setup-and-run.ps1` - Installation complète et démarrage
Ce script fait tout en une seule fois :
- Installation des dépendances de l'API
- Génération des clients Prisma (PostgreSQL + MongoDB)
- Installation des dépendances du Frontend
- Démarrage du serveur de développement Frontend

**Utilisation :**
```powershell
.\setup-and-run.ps1
```

### 2. `start-dev.ps1` - Démarrage en parallèle
Lance l'API et le Frontend simultanément (après installation).

**Utilisation :**
```powershell
.\start-dev.ps1
```

## 🚀 Démarrage rapide

### Première installation
```powershell
# Exécuter le script d'installation
.\setup-and-run.ps1
```

### Après l'installation
```powershell
# Démarrer les deux serveurs
.\start-dev.ps1
```

## 📦 Commandes manuelles

### API
```powershell
cd api
npm install
npm run prisma:generate        # Génère les deux clients Prisma
npm run prisma:generate:postgres  # Génère uniquement le client PostgreSQL
npm run prisma:generate:mongodb   # Génère uniquement le client MongoDB
npm run dev                    # Lance l'API en mode dev
```

### Frontend
```powershell
cd front
npm install
npm run dev                    # Lance le frontend en mode dev
```

## 🔧 Variables d'environnement

Les fichiers `.env` sont déjà configurés dans :
- `api/.env` - Variables pour l'API et Prisma
- `credentials/postgres.env` - Configuration PostgreSQL
- `credentials/mongo.env` - Configuration MongoDB

## 🎮 URLs de l'application

- **Frontend** : http://localhost:3000
- **API** : http://localhost:3000 (ou le port configuré)
- **Swagger** : http://localhost:3000/api-docs
