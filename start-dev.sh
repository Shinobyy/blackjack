#!/bin/bash
# Script pour démarrer l'API et le Frontend en parallèle

echo "========================================"
echo "  DÉMARRAGE DU PROJET BLACKJACK"
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
cd api || exit 1
npm run dev &
API_PID=$!
cd ..

# Lancer le Frontend en arrière-plan
cd front || exit 1
npm run dev &
FRONT_PID=$!
cd ..

# Attendre que les deux processus se terminent
wait $API_PID $FRONT_PID
