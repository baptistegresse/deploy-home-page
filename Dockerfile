FROM oven/bun:1

WORKDIR /app

# Installer zip
RUN apt-get update && apt-get install -y zip && rm -rf /var/lib/apt/lists/*

# Copier les fichiers
COPY package.json .
COPY server.js .

# Installer les dépendances
RUN bun install

# Exposer le port
EXPOSE 3000

# Démarrer le serveur
CMD ["bun", "server.js"]
