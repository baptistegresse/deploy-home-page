FROM oven/bun:1

WORKDIR /app

# Copier les fichiers
COPY package.json .
COPY server-heroku.js .

# Installer les dépendances
RUN bun install

# Exposer le port
EXPOSE 3000

# Démarrer le serveur
CMD ["bun", "server-heroku.js"]
