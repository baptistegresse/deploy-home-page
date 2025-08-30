import { serve } from "bun";
import fs from "fs";
import path from "path";

const server = serve({
  port: process.env.PORT || 3000,
  fetch(req) {
    const url = new URL(req.url);

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
      return handleDeploy(req);
    }

    return new Response("Not found", { status: 404 });
  },
});

async function handleDeploy(req) {
  try {
    const body = await req.json();
    const htmlContent = body.htmlContent;

    if (!htmlContent) {
      return new Response(JSON.stringify({
        success: false,
        error: "htmlContent manquant dans le body"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log("📨 HTML reçu:", htmlContent.substring(0, 100) + "...");

    // Utiliser l'API Netlify directement
    const token = process.env.NETLIFY_TOKEN;

    if (!token) {
      throw new Error("NETLIFY_TOKEN manquant dans les variables d'environnement");
    }

    console.log("🚀 Déploiement via API Netlify...");

    // Créer un nouveau site
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

    if (!createSiteResponse.ok) {
      const errorText = await createSiteResponse.text();
      throw new Error(`Erreur création site: ${createSiteResponse.status} - ${errorText}`);
    }

    const site = await createSiteResponse.json();
    console.log("✅ Site créé:", site.name);

    // Attendre que le site soit prêt
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Créer un dossier temporaire avec le HTML
    const tempDir = path.join(process.cwd(), `temp-${Date.now()}`);
    fs.mkdirSync(tempDir);
    fs.writeFileSync(path.join(tempDir, "index.html"), htmlContent, "utf-8");

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
    fs.writeFileSync(path.join(tempDir, "netlify.toml"), netlifyConfig);

    console.log("📁 Fichiers préparés dans:", tempDir);

    // Déployer via l'API Netlify (méthode recommandée pour Render)
    console.log("🔄 Déploiement via API...");

    // Créer un fichier ZIP avec le contenu
    const { execSync } = await import("child_process");

    try {
      // Créer un fichier ZIP (plus fiable que l'API directe)
      execSync(`cd ${tempDir} && zip -r ../deploy-${Date.now()}.zip .`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      const zipPath = path.join(process.cwd(), `deploy-${Date.now()}.zip`);
      const zipContent = fs.readFileSync(zipPath);

      // Déployer le ZIP via l'API
      const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/zip'
        },
        body: zipContent
      });

      if (!deployResponse.ok) {
        const errorText = await deployResponse.text();
        throw new Error(`Erreur déploiement API: ${deployResponse.status} - ${errorText}`);
      }

      const deploy = await deployResponse.json();
      console.log("✅ Déploiement API réussi:", deploy);

      // Nettoyer les fichiers temporaires
      fs.rmSync(tempDir, { recursive: true, force: true });
      fs.unlinkSync(zipPath);

      const deployUrl = `https://${site.name}.netlify.app`;

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

      if (!deployResponse.ok) {
        const errorText = await deployResponse.text();
        throw new Error(`Erreur déploiement API: ${deployResponse.status} - ${errorText}`);
      }

      const deploy = await deployResponse.json();
      console.log("✅ Déploiement API réussi:", deploy);

      // Nettoyer le dossier temporaire
      fs.rmSync(tempDir, { recursive: true, force: true });

      const deployUrl = `https://${site.name}.netlify.app`;

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
    console.error("❌ Erreur:", error.message);

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
