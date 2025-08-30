import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const siteDir = path.join(process.cwd(), "site");

// 1. Nettoyer / recréer le dossier
if (fs.existsSync(siteDir)) {
  fs.rmSync(siteDir, { recursive: true, force: true });
}
fs.mkdirSync(siteDir);

// 2. Exemple HTML (plus tard n8n enverra ce contenu)
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Homepage auto</title>
</head>
<body>
  <h1>Hello depuis n8n 🚀</h1>
</body>
</html>
`;
fs.writeFileSync(path.join(siteDir, "index.html"), html, "utf-8");

// 3. Déploiement avec Netlify CLI (--create-site)
async function deployToNetlify() {
  try {
    console.log('🚀 Déploiement en cours...');

    // Utiliser --create-site directement (plus simple)
    const output = execSync(`netlify deploy --create-site --dir=${siteDir} --prod --message "Deployment via script"`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    console.log('✅ Déploiement réussi !');

    // Extraire l'URL
    const urlMatch = output.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      console.log(`🌐 URL: ${urlMatch[0]}`);
    }

  } catch (err) {
    console.error("❌ Erreur:", err.message);

    // Fallback: déployer sur un site existant
    console.log('🔄 Tentative de déploiement sur site existant...');
    try {
      execSync(`netlify deploy --dir=${siteDir} --prod --message "Deployment via script"`, {
        stdio: 'inherit'
      });
      console.log('✅ Déploiement réussi sur site existant !');
    } catch (fallbackErr) {
      console.error('❌ Échec du fallback:', fallbackErr.message);
    }
  }
}

// Exécuter le déploiement
deployToNetlify();
