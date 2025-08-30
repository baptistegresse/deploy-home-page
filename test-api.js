#!/usr/bin/env bun

// Script de test pour l'API Auto Homepage
const testHtml = fs.readFileSync('./test.html', 'utf-8');

async function testAPI() {
  console.log('🧪 Test de l\'API Auto Homepage...');

  try {
    const response = await fetch('http://localhost:3000/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        htmlContent: testHtml
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Test réussi !');
      console.log('🌐 URL de déploiement:', result.deployUrl);
      console.log('🏷️ Nom du site:', result.siteName);
      console.log('🆔 ID du site:', result.siteId);
    } else {
      console.log('❌ Test échoué:', result.error);
    }

  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    console.log('💡 Assurez-vous que le serveur est démarré sur le port 3000');
  }
}

// Lancer le test
testAPI();
