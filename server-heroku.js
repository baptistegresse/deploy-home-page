import { serve } from "bun";

const server = serve({
  port: process.env.PORT || 3000,
  fetch(req) {
    const url = new URL(req.url);
 
    if (url.pathname === "/") {
      return new Response(`
        <html>
          <body>
            <h1>🚀 Serveur de déploiement Netlify (Version Hébergée)</h1>
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
 
    // Utiliser l'API Netlify directement (pas de CLI)
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
    console.log("⏳ Attente que le site soit prêt...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Vérifier l'état du site
    const siteStatusResponse = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (siteStatusResponse.ok) {
      const siteStatus = await siteStatusResponse.json();
      console.log("📊 État du site:", siteStatus.state);
    }
    
    // Utiliser l'API de déploiement par contenu direct (plus fiable)
    console.log("📤 Déploiement via API contenu direct...");
    
    // Créer le contenu HTML avec des métadonnées
    const deployContent = {
      files: {
        'index.html': {
          content: htmlContent,
          encoding: 'utf8'
        }
      },
      message: "Deployment via API direct",
      draft: false
    };
    
    const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deployContent)
    });
    
    if (!deployResponse.ok) {
      const errorText = await deployResponse.text();
      throw new Error(`Erreur déploiement: ${deployResponse.status} - ${errorText}`);
    }
    
    const deploy = await deployResponse.json();
    console.log("✅ Déploiement réussi:", deploy);
    
    // Attendre que le déploiement soit terminé
    console.log("⏳ Attente fin du déploiement...");
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const deployUrl = `https://${site.name}.netlify.app`;
    
    return new Response(JSON.stringify({
      success: true,
      message: "Site déployé avec succès (méthode directe)",
      deployUrl: deployUrl,
      siteName: site.name,
      siteId: site.id,
      deployId: deploy.id,
      state: deploy.state,
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" }
    });
 
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

console.log(`🚀 Serveur de déploiement (Version Hébergée) démarré sur le port ${process.env.PORT || 3000}`);
console.log(`📝 Envoyez du HTML via POST sur /deploy`);
console.log(`🌐 Prêt pour l'hébergement sur Render/Railway/Fly.io !`);
