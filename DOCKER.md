# 🐳 Docker - Guide de démarrage

## 🚀 Lancement du projet

**Une seule commande :**

```bash
docker compose up -d
```

## 📦 Services disponibles

| Service | Port | URL |
|---------|------|-----|
| **Frontend** | 3001 | http://localhost:3001 |
| **API** | 3078 | http://localhost:3078 |
| **PostgreSQL** | 5432 | localhost:5432 |
| **MongoDB** | 27017 | localhost:27017 |

## 🛠️ Commandes essentielles

### Arrêter
```bash
docker compose down
```

### Voir les logs
```bash
docker compose logs -f
```

### Redémarrer
```bash
docker compose restart
```

### Voir l'état
```bash
docker compose ps
```

### Reconstruire
```bash
docker compose up -d --build
```

## � En cas de problème

### Nettoyer et recommencer
```bash
docker compose down -v
docker compose up -d --build
```

C'est tout ! 🎲
