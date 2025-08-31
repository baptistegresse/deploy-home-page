#!/usr/bin/env bun

// Test de déploiement du site Webflow complet
console.log('🚀 Test de déploiement du site Webflow complet...');

import fs from 'fs';
import path from 'path'; // Added missing import for path

// Lire le fichier HTML de test Webflow
const htmlContent = fs.readFileSync('./test-webflow.html', 'utf-8');
console.log('📖 HTML Webflow lu, taille:', htmlContent.length, 'caractères');

// Vérifier la structure du dossier site
const siteDir = './site';
if (fs.existsSync(siteDir)) {
  console.log('📁 Structure du dossier site détectée:');

  // Vérifier les sous-dossiers
  const cssDir = './site/css';
  const jsDir = './site/js';
  const imagesDir = './site/images';

  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir);
    console.log('   📁 CSS:', cssFiles.length, 'fichiers');
    cssFiles.forEach(file => {
      const stats = fs.statSync(path.join(cssDir, file));
      console.log(`      📄 ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
    });
  }

  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir);
    console.log('   📁 JS:', jsFiles.length, 'fichiers');
    jsFiles.forEach(file => {
      const stats = fs.statSync(path.join(jsDir, file));
      console.log(`      📄 ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
    });
  }

  if (fs.existsSync(imagesDir)) {
    const imageFiles = fs.readdirSync(imagesDir);
    console.log('   📁 Images:', imageFiles.length, 'fichiers');
    imageFiles.forEach(file => {
      const stats = fs.statSync(path.join(imagesDir, file));
      console.log(`      🖼️ ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
    });
  }

  console.log('');
  console.log('🎯 Le serveur va automatiquement:');
  console.log('   1. Remplacer index.html par ce contenu HTML personnalisé');
  console.log('   2. Copier tous les fichiers CSS Webflow');
  console.log('   3. Copier tous les fichiers JavaScript Webflow');
  console.log('   4. Copier toutes les images et assets');
  console.log('   5. Déployer le site complet sur Netlify');

} else {
  console.log('⚠️ Dossier site non trouvé');
}

// URL de l'API (à adapter selon votre déploiement)
const apiUrl = 'https://deploy-home-page.onrender.com/deploy';
// const apiUrl = 'http://localhost:3000/deploy'; // Pour test local

async function testWebflowDeploy() {
  try {
    console.log('📡 Envoi de la requête de déploiement Webflow...');
    console.log('🌐 URL:', apiUrl);

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
      console.log('✅ Déploiement Webflow réussi !');
      console.log('📊 Résultat:', JSON.stringify(result, null, 2));

      if (result.deployUrl) {
        console.log('🌐 URL du site déployé:', result.deployUrl);
        console.log('🏷️ Nom du site:', result.siteName);
        console.log('🆔 ID du site:', result.siteId);
        console.log('');
        console.log('🎯 Maintenant tu peux:');
        console.log('   - Visiter le site pour voir le HTML personnalisé');
        console.log('   - Vérifier que les styles Webflow sont appliqués');
        console.log('   - Vérifier que le JavaScript Webflow fonctionne');
        console.log('   - Vérifier que les images sont chargées');
        console.log('   - Ouvrir la console pour voir les logs');
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
testWebflowDeploy();
