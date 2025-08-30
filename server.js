import { serve } from "bun";
import fs from "fs";
import path from "path";

console.log("🚀 Démarrage du serveur Auto Homepage...");
console.log("📁 Répertoire de travail:", process.cwd());
console.log("🔧 Variables d'environnement:", {
  PORT: process.env.PORT || 3000,
  NETLIFY_TOKEN: process.env.NETLIFY_TOKEN ? "✅ Configuré" : "❌ Manquant"
});

const server = serve({
  port: process.env.PORT || 3000,
  fetch(req) {
    const url = new URL(req.url);
    console.log(`📥 Requête reçue: ${req.method} ${url.pathname}`);

    if (url.pathname === "/") {
      return new Response(`
        <html>
          <body>
            <h1>🚀 Serveur de déploiement Netlify</h1>
            <p>Envoyez du HTML via POST sur /deploy</p>
            <p>Exemple avec curl:</p>
            <pre>curl -X POST http://localhost:3000/deploy \\
  -H "Content-Type: application/json" \\
  -d '{"htmlContent": "&lt;h1&gt;Hello World&lt;/h1&gt;"}'</pre>
          </body>
        </html>
      `, { headers: { "Content-Type": "text/html" } });
    }

    if (url.pathname === "/deploy" && req.method === "POST") {
      console.log("🚀 Déploiement demandé");
      return handleDeploy(req);
    }

    if (url.pathname === "/health") {
      console.log("🏥 Endpoint de santé demandé");
      const healthInfo = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          cwd: process.cwd(),
          port: process.env.PORT || 3000,
          netlifyToken: process.env.NETLIFY_TOKEN ? "✅ Configuré" : "❌ Manquant"
        }
      };

      return new Response(JSON.stringify(healthInfo, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log("❌ Route non trouvée:", url.pathname);
    return new Response("Not found", { status: 404 });
  },
});

async function handleDeploy(req) {
  console.log("🔄 Début du traitement du déploiement...");

  try {
    console.log("📖 Lecture du body de la requête...");
    const body = await req.json();
    const htmlContent = body.htmlContent;

    if (!htmlContent) {
      console.log("❌ htmlContent manquant dans le body");
      return new Response(JSON.stringify({
        success: false,
        error: "htmlContent manquant dans le body"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log("📨 HTML reçu:", htmlContent.substring(0, 100) + "...");
    console.log("📏 Taille du HTML:", htmlContent.length, "caractères");

    // Utiliser l'API Netlify directement
    const token = process.env.NETLIFY_TOKEN;

    if (!token) {
      console.log("❌ NETLIFY_TOKEN manquant dans les variables d'environnement");
      throw new Error("NETLIFY_TOKEN manquant dans les variables d'environnement");
    }

    console.log("🔑 Token Netlify trouvé, longueur:", token.length);
    console.log("🚀 Déploiement via API Netlify...");

    // Créer un nouveau site
    console.log("🏗️ Création d'un nouveau site Netlify...");
    const createSiteResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `auto-homepage-${Date.now()}`
      })
    });

    console.log("📡 Réponse création site - Status:", createSiteResponse.status);
    console.log("📡 Réponse création site - Headers:", Object.fromEntries(createSiteResponse.headers.entries()));

    if (!createSiteResponse.ok) {
      const errorText = await createSiteResponse.text();
      console.log("❌ Erreur création site - Body:", errorText);
      throw new Error(`Erreur création site: ${createSiteResponse.status} - ${errorText}`);
    }

    const site = await createSiteResponse.json();
    console.log("✅ Site créé:", site.name);
    console.log("🆔 ID du site:", site.id);
    console.log("🌐 URL du site:", site.url);

    // Attendre que le site soit prêt
    console.log("⏳ Attente de 3 secondes pour que le site soit prêt...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log("✅ Attente terminée");

    // Créer un dossier temporaire avec le HTML
    const tempDir = path.join(process.cwd(), `temp-${Date.now()}`);
    console.log("📁 Création du dossier temporaire:", tempDir);
    fs.mkdirSync(tempDir);

    const htmlPath = path.join(tempDir, "index.html");
    console.log("📝 Écriture du fichier HTML:", htmlPath);
    fs.writeFileSync(htmlPath, htmlContent, "utf-8");
    console.log("✅ Fichier HTML écrit");

    // Créer un fichier netlify.toml pour la configuration
    const netlifyConfig = `
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
    const tomlPath = path.join(tempDir, "netlify.toml");
    console.log("📝 Écriture du fichier netlify.toml:", tomlPath);
    fs.writeFileSync(tomlPath, netlifyConfig);
    console.log("✅ Fichier netlify.toml écrit");

    console.log("📁 Fichiers préparés dans:", tempDir);
    console.log("📋 Contenu du dossier:", fs.readdirSync(tempDir));

    // Déployer via l'API Netlify (méthode recommandée pour Render)
    console.log("🔄 Déploiement via API...");

    // Créer un fichier ZIP avec le contenu
    const { execSync } = await import("child_process");

    try {
      // Créer un fichier ZIP (plus fiable que l'API directe)
      console.log("🗜️ Création du fichier ZIP...");
      const zipCommand = `cd ${tempDir} && zip -r ../deploy-${Date.now()}.zip .`;
      console.log("💻 Commande ZIP:", zipCommand);

      execSync(zipCommand, {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      const zipPath = path.join(process.cwd(), `deploy-${Date.now()}.zip`);
      console.log("✅ Fichier ZIP créé:", zipPath);

      // Vérifier que le fichier ZIP existe et a une taille > 0
      if (!fs.existsSync(zipPath)) {
        throw new Error("Le fichier ZIP n'a pas été créé");
      }

      const zipStats = fs.statSync(zipPath);
      console.log("📏 Taille du fichier ZIP:", zipStats.size, "octets");

      if (zipStats.size === 0) {
        throw new Error("Le fichier ZIP est vide");
      }

      const zipContent = fs.readFileSync(zipPath);
      console.log("📖 Contenu du ZIP lu, taille:", zipContent.length, "octets");

      // Déployer le ZIP via l'API
      console.log("🚀 Déploiement du ZIP via l'API Netlify...");
      const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/zip'
        },
        body: zipContent
      });

      console.log("📡 Réponse déploiement ZIP - Status:", deployResponse.status);
      console.log("📡 Réponse déploiement ZIP - Headers:", Object.fromEntries(deployResponse.headers.entries()));

      if (!deployResponse.ok) {
        const errorText = await deployResponse.text();
        console.log("❌ Erreur déploiement ZIP - Body:", errorText);
        throw new Error(`Erreur déploiement API: ${deployResponse.status} - ${errorText}`);
      }

      const deploy = await deployResponse.json();
      console.log("✅ Déploiement API réussi:", deploy);
      console.log("🆔 ID du déploiement:", deploy.id);
      console.log("📊 État du déploiement:", deploy.state);

      // Nettoyer les fichiers temporaires
      console.log("🧹 Nettoyage des fichiers temporaires...");
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log("✅ Dossier temporaire supprimé");

      fs.unlinkSync(zipPath);
      console.log("✅ Fichier ZIP supprimé");

      const deployUrl = `https://${site.name}.netlify.app`;
      console.log("🌐 URL finale de déploiement:", deployUrl);

      return new Response(JSON.stringify({
        success: true,
        message: "Site déployé avec succès (via API)",
        deployUrl: deployUrl,
        siteName: site.name,
        siteId: site.id,
        timestamp: new Date().toISOString()
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (zipError) {
      console.error("❌ Erreur création ZIP:", zipError.message);
      console.error("❌ Stack trace:", zipError.stack);

      // Fallback: déployer directement via l'API avec le contenu HTML
      console.log("🔄 Fallback: déploiement direct HTML...");

      const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            'index.html': {
              content: htmlContent
            },
            'netlify.toml': {
              content: netlifyConfig
            }
          }
        })
      });

      console.log("📡 Réponse déploiement fallback - Status:", deployResponse.status);
      console.log("📡 Réponse déploiement fallback - Headers:", Object.fromEntries(deployResponse.headers.entries()));

      if (!deployResponse.ok) {
        const errorText = await deployResponse.text();
        console.log("❌ Erreur déploiement fallback - Body:", errorText);
        throw new Error(`Erreur déploiement API: ${deployResponse.status} - ${errorText}`);
      }

      const deploy = await deployResponse.json();
      console.log("✅ Déploiement API fallback réussi:", deploy);
      console.log("🆔 ID du déploiement fallback:", deploy.id);

      // Nettoyer le dossier temporaire
      console.log("🧹 Nettoyage du dossier temporaire (fallback)...");
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log("✅ Dossier temporaire supprimé (fallback)");

      const deployUrl = `https://${site.name}.netlify.app`;
      console.log("🌐 URL finale de déploiement (fallback):", deployUrl);

      return new Response(JSON.stringify({
        success: true,
        message: "Site déployé avec succès (via API fallback)",
        deployUrl: deployUrl,
        siteName: site.name,
        siteId: site.id,
        timestamp: new Date().toISOString()
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    console.error("❌ Erreur générale:", error.message);
    console.error("❌ Stack trace complète:", error.stack);
    console.error("❌ Type d'erreur:", error.constructor.name);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

console.log(`🚀 Serveur de déploiement démarré sur le port ${process.env.PORT || 3000}`);
console.log(`📝 Envoyez du HTML via POST sur /deploy`);
console.log(`🔍 Logs détaillés activés pour le débogage en production`);
