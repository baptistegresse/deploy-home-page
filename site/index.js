// JavaScript du dossier site - chargé automatiquement
console.log("🚀 JavaScript du dossier site chargé avec succès !");

// Afficher le timestamp
document.addEventListener('DOMContentLoaded', function () {
  const timestampElement = document.getElementById('timestamp');
  if (timestampElement) {
    timestampElement.textContent = new Date().toLocaleString('fr-FR');
    console.log("✅ Timestamp mis à jour");
  }

  // Ajouter une animation aux features
  const features = document.querySelectorAll('.feature');
  features.forEach((feature, index) => {
    feature.style.animationDelay = `${index * 0.2}s`;
    feature.style.animation = 'fadeIn 0.8s ease-out forwards';
    feature.style.opacity = '0';
  });

  console.log("✅ Animations des features configurées");
});

// Fonction pour tester que le JavaScript fonctionne
function testJavaScript() {
  alert("🎉 JavaScript du dossier site fonctionne parfaitement !");
  return true;
}

// Exposer la fonction globalement pour les tests
window.testJavaScript = testJavaScript;