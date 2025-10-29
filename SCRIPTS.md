# 🎲 Scripts de développement Blackjack

## 📋 Scripts disponibles

### 1. `setup-and-run` - Installation complète et démarrage
Ce script fait tout en une seule fois :
- Installation des dépendances de l'API
- Génération des clients Prisma (PostgreSQL + MongoDB)
- Installation des dépendances du Frontend
- Démarrage du serveur de développement Frontend

**Utilisation PowerShell :**
```powershell
.\setup-and-run.ps1
```

**Utilisation Bash/Linux/Mac :**
```bash
chmod +x setup-and-run.sh
./setup-and-run.sh
```

### 2. `start-dev` - Démarrage en parallèle
Lance l'API et le Frontend simultanément (après installation).

**Utilisation PowerShell :**
```powershell
.\start-dev.ps1
```

**Utilisation Bash/Linux/Mac :**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

## 🚀 Démarrage rapide

### Première installation

**Windows (PowerShell) :**
```powershell
# Exécuter le script d'installation
.\setup-and-run.ps1
```

**Linux/Mac (Bash) :**
```bash
# Rendre le script exécutable (une seule fois)
chmod +x setup-and-run.sh

# Exécuter le script d'installation
./setup-and-run.sh
```

### Après l'installation

**Windows (PowerShell) :**
```powershell
# Démarrer les deux serveurs
.\start-dev.ps1
```

**Linux/Mac (Bash) :**
```bash
# Rendre le script exécutable (une seule fois)
chmod +x start-dev.sh

# Démarrer les deux serveurs
./start-dev.sh
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
