#!/usr/bin/env bun

// Test de déploiement du site complet avec dossier site/
console.log('🚀 Test de déploiement du site complet...');

import fs from 'fs';

// Lire le fichier HTML de test
const htmlContent = fs.readFileSync('./test-simple.html', 'utf-8');
console.log('📖 HTML lu, taille:', htmlContent.length, 'caractères');

// Vérifier que les fichiers du dossier site existent
const siteDir = './site';
if (fs.existsSync(siteDir)) {
    const siteFiles = fs.readdirSync(siteDir, { recursive: true });
    console.log('📁 Fichiers du dossier site trouvés:', siteFiles);
} else {
    console.log('⚠️ Dossier site non trouvé');
}

// URL de l'API (à adapter selon votre déploiement)
const apiUrl = 'https://deploy-home-page.onrender.com/deploy';
// const apiUrl = 'http://localhost:3000/deploy'; // Pour test local

async function testSiteComplet() {
  try {
    console.log('📡 Envoi de la requête de déploiement du site complet...');
    console.log('🌐 URL:', apiUrl);
    console.log('📋 Le serveur va automatiquement:');
    console.log('   1. Remplacer index.html par ce contenu');
    console.log('   2. Copier tous les fichiers du dossier site/');
    console.log('   3. Déployer le tout sur Netlify');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        htmlContent: htmlContent
      })
    });
    
    console.log('📡 Réponse reçue - Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Déploiement du site complet réussi !');
      console.log('📊 Résultat:', JSON.stringify(result, null, 2));
      
      if (result.deployUrl) {
        console.log('🌐 URL du site déployé:', result.deployUrl);
        console.log('🏷️ Nom du site:', result.siteName);
        console.log('🆔 ID du site:', result.siteId);
        console.log('');
        console.log('🎯 Maintenant tu peux:');
        console.log('   - Visiter le site pour voir le CSS et JS');
        console.log('   - Ouvrir la console pour voir les logs JS');
        console.log('   - Tester la fonction testJavaScript()');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur de déploiement:');
      console.log('   Status:', response.status);
      console.log('   Body:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }
}

// Lancer le test
testSiteComplet();
