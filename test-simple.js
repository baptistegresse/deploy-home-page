#!/usr/bin/env bun

// Test simple pour vérifier que le serveur fonctionne
console.log('🧪 Test simple du serveur...');

// Test de l'endpoint de santé
async function testHealth() {
  try {
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    console.log('✅ Endpoint /health:', data);
  } catch (error) {
    console.log('❌ Erreur /health:', error.message);
  }
}

// Test de l'endpoint racine
async function testRoot() {
  try {
    const response = await fetch('http://localhost:3000/');
    const text = await response.text();
    console.log('✅ Endpoint /:', text.substring(0, 100) + '...');
  } catch (error) {
    console.log('❌ Erreur /:', error.message);
  }
}

// Lancer les tests
async function runTests() {
  console.log('🚀 Lancement des tests...');
  await testHealth();
  await testRoot();
  console.log('✅ Tests terminés');
}

runTests();
