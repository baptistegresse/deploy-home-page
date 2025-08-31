#!/usr/bin/env bun

// Test de l'environnement système
console.log('🔍 Test de l\'environnement système...');

import { execSync } from "child_process";

// Vérifier les commandes système
const commands = ['zip', 'which', 'ls', 'pwd'];

commands.forEach(cmd => {
  try {
    const result = execSync(`which ${cmd}`, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`✅ ${cmd}: ${result.trim()}`);
  } catch (error) {
    console.log(`❌ ${cmd}: Non disponible`);
  }
});

// Vérifier le répertoire de travail
console.log('📁 Répertoire de travail:', process.cwd());

// Vérifier les variables d'environnement
console.log('🔧 Variables d\'environnement importantes:');
console.log('  - PORT:', process.env.PORT || 'non défini');
console.log('  - NETLIFY_TOKEN:', process.env.NETLIFY_TOKEN ? '✅ Configuré' : '❌ Manquant');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'non défini');

// Vérifier les permissions du répertoire
import fs from 'fs';
try {
  const stats = fs.statSync(process.cwd());
  console.log('📊 Permissions du répertoire:', stats.mode.toString(8));
  console.log('👤 Propriétaire:', stats.uid);
  console.log('👥 Groupe:', stats.gid);
} catch (error) {
  console.log('❌ Erreur lecture permissions:', error.message);
}

// Test de création de fichier temporaire
import path from 'path';
try {
  const testFile = path.join(process.cwd(), 'test-temp.txt');
  fs.writeFileSync(testFile, 'test');
  console.log('✅ Test création fichier réussi');
  fs.unlinkSync(testFile);
  console.log('✅ Test suppression fichier réussi');
} catch (error) {
  console.log('❌ Erreur test fichiers:', error.message);
}

console.log('✅ Test environnement terminé');
