#!/usr/bin/env pwsh
# Script de setup et lancement du projet Blackjack

Write-Host "========================================" -ForegroundColor Green
Write-Host "  SETUP PROJET BLACKJACK" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# API Setup
Write-Host ">>> Installation des dépendances API..." -ForegroundColor Cyan
Set-Location api
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de l'installation des dépendances API" -ForegroundColor Red
    exit 1
}

Write-Host ">>> Génération des clients Prisma..." -ForegroundColor Cyan
npm run prisma:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de la génération Prisma" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ API configurée avec succès!" -ForegroundColor Green
Write-Host ""

# Front Setup
Write-Host ">>> Installation des dépendances Frontend..." -ForegroundColor Cyan
Set-Location ../front
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de l'installation des dépendances Frontend" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Frontend configuré avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DÉMARRAGE DES SERVEURS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host ">>> Démarrage de l'API sur http://localhost:3000..." -ForegroundColor Cyan
Write-Host ">>> Démarrage du Frontend sur http://localhost:3001..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter les serveurs" -ForegroundColor Yellow
Write-Host ""

# Lancer l'API en arrière-plan
Set-Location ../api
$apiJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

# Retourner au frontend et le lancer
Set-Location ../front
$frontJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

# Afficher les logs des deux processus
try {
    while ($true) {
        Receive-Job $apiJob -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "[API] $_" -ForegroundColor Blue }
        Receive-Job $frontJob -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "[FRONT] $_" -ForegroundColor Magenta }
        Start-Sleep -Milliseconds 100
    }
}
finally {
    # Cleanup quand on arrête le script
    Write-Host ""
    Write-Host "Arrêt des serveurs..." -ForegroundColor Yellow
    Stop-Job $apiJob, $frontJob
    Remove-Job $apiJob, $frontJob
    Write-Host "Serveurs arrêtés." -ForegroundColor Green
}
