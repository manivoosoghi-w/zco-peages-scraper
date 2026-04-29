# Image Playwright officielle (Chromium déjà installé)
FROM mcr.microsoft.com/playwright:focal

# Dossier de travail
WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer les dépendances Node
RUN npm install

# Installer les navigateurs Playwright (OBLIGATOIRE SUR RENDER)
RUN npx playwright install --with-deps

# Copier le code
COPY . .

# Exposer le port
EXPOSE 3000

# Lancer le serveur
CMD ["node", "index.js"]
