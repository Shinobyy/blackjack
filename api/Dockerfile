# Dockerfile pour l'API
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Copier le fichier .env.docker comme .env pour Docker
COPY .env.docker .env

# Générer les clients Prisma
RUN npm run prisma:generate

# Exposer le port
EXPOSE 3078

# Démarrer l'application
CMD ["npm", "run", "dev"]
