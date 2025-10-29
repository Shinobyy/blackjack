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
Write-Host "  DÉMARRAGE DU SERVEUR DE DÉVELOPPEMENT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Lancement du serveur de développement
npm run dev
