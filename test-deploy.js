#!/usr/bin/env bun

// Test de déploiement avec le fichier HTML simple
console.log('🚀 Test de déploiement...');

import fs from 'fs';

// Lire le fichier HTML de test
const htmlContent = fs.readFileSync('./test-simple.html', 'utf-8');
console.log('📖 HTML lu, taille:', htmlContent.length, 'caractères');

// URL de l'API (à adapter selon votre déploiement)
const apiUrl = 'https://deploy-home-page.onrender.com/deploy';
// const apiUrl = 'http://localhost:3000/deploy'; // Pour test local

async function testDeploy() {
  try {
    console.log('📡 Envoi de la requête de déploiement...');
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
    console.log('📡 Réponse reçue - Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Déploiement réussi !');
      console.log('📊 Résultat:', JSON.stringify(result, null, 2));
      
      if (result.deployUrl) {
        console.log('🌐 URL du site déployé:', result.deployUrl);
        console.log('🏷️ Nom du site:', result.siteName);
        console.log('🆔 ID du site:', result.siteId);
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
testDeploy();
