#!/bin/bash
# Script de setup et lancement du projet Blackjack

echo "========================================"
echo "  SETUP PROJET BLACKJACK"
echo "========================================"
echo ""

# API Setup
echo ">>> Installation des dépendances API..."
cd api || exit 1
npm install

if [ $? -ne 0 ]; then
    echo "Erreur lors de l'installation des dépendances API"
    exit 1
fi

echo ">>> Génération des clients Prisma..."
npm run prisma:generate

if [ $? -ne 0 ]; then
    echo "Erreur lors de la génération Prisma"
    exit 1
fi

echo ""
echo "✓ API configurée avec succès!"
echo ""

# Front Setup
echo ">>> Installation des dépendances Frontend..."
cd ../front || exit 1
npm install

if [ $? -ne 0 ]; then
    echo "Erreur lors de l'installation des dépendances Frontend"
    exit 1
fi

echo ""
echo "✓ Frontend configuré avec succès!"
echo ""
echo "========================================"
echo "  DÉMARRAGE DES SERVEURS"
echo "========================================"
echo ""

echo ">>> Démarrage de l'API sur http://localhost:3000..."
echo ">>> Démarrage du Frontend sur http://localhost:3001..."
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les serveurs"
echo ""

# Fonction pour nettoyer les processus
cleanup() {
    echo ""
    echo "Arrêt des serveurs..."
    kill $API_PID $FRONT_PID 2>/dev/null
    echo "Serveurs arrêtés."
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT SIGTERM

# Lancer l'API en arrière-plan
cd ../api || exit 1
npm run dev &
API_PID=$!
cd ../front

# Lancer le Frontend en arrière-plan
npm run dev &
FRONT_PID=$!

# Attendre que les deux processus se terminent
wait $API_PID $FRONT_PID
