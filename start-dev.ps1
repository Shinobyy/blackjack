#!/usr/bin/env pwsh
# Script pour démarrer l'API et le Frontend en parallèle

Write-Host "========================================" -ForegroundColor Green
Write-Host "  DÉMARRAGE DU PROJET BLACKJACK" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host ">>> Démarrage de l'API sur http://localhost:3000..." -ForegroundColor Cyan
Write-Host ">>> Démarrage du Frontend sur http://localhost:3001..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter les serveurs" -ForegroundColor Yellow
Write-Host ""

# Lancer l'API en arrière-plan
$apiJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD/api
    npm run dev
}

# Lancer le Frontend en arrière-plan
$frontJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD/front
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
