# Auto Homepage - Déploiement Netlify Automatique

Un serveur simple qui permet de déployer automatiquement du contenu HTML sur Netlify via une API REST.

## 🚀 Déploiement sur Render

### Prérequis

1. Un compte [Render](https://render.com) (gratuit)
2. Un token d'API Netlify (voir ci-dessous)

### Configuration

1. **Forkez ce repository** sur GitHub
2. **Connectez votre repo** à Render
3. **Configurez les variables d'environnement** :
   - `NETLIFY_TOKEN` : Votre token d'API Netlify (obligatoire)

### Variables d'environnement

Copiez `config.env.example` vers `.env` et configurez :

```bash
# Port du serveur (optionnel, défaut: 3000)
PORT=3000

# Token d'API Netlify (OBLIGATOIRE)
# Obtenez-le sur: https://app.netlify.com/user/settings/applications
NETLIFY_TOKEN=your_netlify_personal_access_token_here
```

### Obtenir un token Netlify

1. Allez sur [Netlify User Settings](https://app.netlify.com/user/settings/applications)
2. Cliquez sur "New access token"
3. Donnez un nom à votre token
4. Copiez le token généré
5. Ajoutez-le dans les variables d'environnement Render

## 📡 Utilisation

### Endpoints disponibles

- **`/`** - Page d'accueil avec instructions
- **`/health`** - Informations de santé du serveur
- **`/test-env`** - Test de l'environnement système
- **`/deploy`** - Déploiement de contenu HTML (POST)

### Déployer du HTML

```bash
curl -X POST https://votre-app.onrender.com/deploy \
  -H "Content-Type: application/json" \
  -d '{"htmlContent": "<h1>Hello World!</h1>"}'
```

### Vérifier la santé du serveur

```bash
curl https://votre-app.onrender.com/health
```

### Tester l'environnement

```bash
curl https://votre-app.onrender.com/test-env
```

### Réponse

```json
{
  "success": true,
  "message": "Site déployé avec succès (via API)",
  "deployUrl": "https://auto-homepage-1234567890.netlify.app",
  "siteName": "auto-homepage-1234567890",
  "siteId": "site-id-here",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔧 Développement local

```bash
# Installer les dépendances
bun install

# Démarrer en mode développement
bun dev

# Démarrer en mode production
bun start
```

## 🏗️ Structure du projet

```
auto-homepage/
├── server.js              # Serveur principal
├── site/                  # Dossier des fichiers du site Webflow
│   ├── index.html        # Page principale Webflow (écrasée par la requête POST)
│   ├── css/              # Styles Webflow (préservés)
│   │   ├── webflow.css   # Styles principaux
│   │   └── normalize.css # Reset CSS
│   ├── js/               # JavaScript Webflow (préservé)
│   │   └── webflow.js    # Fonctionnalités Webflow
│   └── images/           # Assets Webflow (préservés)
│       ├── favicon.ico   # Icône du site
│       └── webclip.png   # Icône mobile
├── test-webflow.html     # HTML de test pour le déploiement Webflow
├── test-*.js             # Scripts de test
└── README.md             # Documentation
```

## 🧪 Tests

### Test simple du serveur
```bash
bun run test-simple.js
```

### Test du site complet avec dossier site/
```bash
bun run test-site-complet.js
```

### Test du site Webflow complet
```bash
bun run test-webflow
```

### Test de l'environnement
```bash
bun run test-env.js
```

### Test de déploiement
```bash
bun run test-deploy.js
```

### Test avec curl
```bash
# Test de santé
curl https://votre-app.onrender.com/health

# Test environnement
curl https://votre-app.onrender.com/test-env

# Test déploiement
curl -X POST https://votre-app.onrender.com/deploy \
  -H "Content-Type: application/json" \
  -d '{"htmlContent": "<h1>Test!</h1>"}'
```

## 🏗️ Architecture

- **Serveur** : Bun runtime avec serveur HTTP natif
- **Déploiement** : API Netlify (pas de CLI requise)
- **Stockage** : Fichiers temporaires locaux (nettoyés après déploiement)
- **Fallback** : Si la création de ZIP échoue, déploiement direct via API
- **Dossier site/** : Tous les fichiers (JS, CSS, images) sont automatiquement inclus
- **HTML dynamique** : L'index.html est remplacé par le contenu de la requête POST

## 🎨 **Intégration Webflow**

- **Structure préservée** : CSS, JavaScript et assets Webflow restent intacts
- **HTML personnalisable** : Contenu dynamique depuis n8n ou autres systèmes
- **Déploiement automatique** : Site complet déployé en une fois
- **Compatibilité** : Fonctionne avec tous les sites Webflow exportés

## 📝 Notes importantes

- Le serveur crée un nouveau site Netlify à chaque déploiement
- Les sites sont nommés avec un timestamp pour éviter les conflits
- Le code est optimisé pour fonctionner sur Render (pas de CLI Netlify)
- Les fichiers temporaires sont automatiquement nettoyés
- **Le dossier `site/` est automatiquement lu et déployé**
- **L'`index.html` du dossier `site/` est remplacé par le contenu de la requête POST**
- **Tous les autres fichiers (JS, CSS, images) sont préservés et déployés**

## 🐛 Dépannage

### Erreur "NETLIFY_TOKEN manquant"
- Vérifiez que la variable d'environnement est configurée sur Render
- Assurez-vous que le token est valide

### Erreur de déploiement
- Vérifiez que votre token Netlify a les bonnes permissions
- Consultez les logs Render pour plus de détails

## 📄 Licence

MIT
