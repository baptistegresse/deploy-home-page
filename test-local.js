#!/usr/bin/env bun

// Test local de la lecture du dossier site
console.log('🧪 Test local de la lecture du dossier site...');

import fs from 'fs';
import path from 'path';

// Simuler la logique du serveur
function testSiteReading() {
  const siteDir = path.join(process.cwd(), "site");
  console.log('📁 Chemin du dossier site:', siteDir);
  
  if (fs.existsSync(siteDir)) {
    console.log('✅ Dossier site trouvé !');
    
    // Lire le contenu
    const items = fs.readdirSync(siteDir, { recursive: true });
    console.log('📋 Contenu du dossier site:', items);
    
    // Vérifier les fichiers importants
    const htmlPath = path.join(siteDir, 'index.html');
    const jsPath = path.join(siteDir, 'index.js');
    const cssPath = path.join(siteDir, 'style.css');
    
    console.log('📄 index.html existe:', fs.existsSync(htmlPath));
    console.log('📄 index.js existe:', fs.existsSync(jsPath));
    console.log('📄 style.css existe:', fs.existsSync(cssPath));
    
    // Lire le contenu des fichiers
    if (fs.existsSync(jsPath)) {
      const jsContent = fs.readFileSync(jsPath, 'utf-8');
      console.log('📖 Contenu de index.js (premiers 100 caractères):', jsContent.substring(0, 100));
    }
    
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      console.log('📖 Contenu de style.css (premiers 100 caractères):', cssContent.substring(0, 100));
    }
    
  } else {
    console.log('❌ Dossier site non trouvé');
    console.log('📁 Répertoire de travail:', process.cwd());
    console.log('📋 Contenu du répertoire:', fs.readdirSync(process.cwd()));
  }
}

// Lancer le test
testSiteReading();
