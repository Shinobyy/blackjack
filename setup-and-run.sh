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
echo "  DÉMARRAGE DU SERVEUR DE DÉVELOPPEMENT"
echo "========================================"
echo ""

# Lancement du serveur de développement
npm run dev
