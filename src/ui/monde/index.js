import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import data from "../../data/data.json";

class MondeView {

  constructor() {
    this.root = htmlToDOM(template);
    this.donnees = data;
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }

  // Trouve les infos d'une compétence cliquée
  getInfo(element) {
    // Récupérer l'ID de l'élément (ex: "Exprimer", "Developper", "Concevoir", etc.)
    const id = element.id;
    
    if (!id) return null;
    
    // Chercher directement dans toutes les compétences du JSON
    for (let competence of Object.values(this.donnees)) {
      // Comparer l'ID du SVG avec le nom_court dans le JSON
      // "Exprimer" === "Exprimer" ✓
      // "Developper" === "Développer" ✗ (donc on vérifie aussi sans accent)
      if (competence.nom_court === id) {
        
        // Calculer le niveau moyen basé sur le nombre de niveaux
        const niveauMoyen = Math.round((competence.niveaux.length / 3) * 100);
        
        // Retourner les infos de la compétence avec le libelle_long
        return {
          competence: competence.nom_court,
          niveau: niveauMoyen,
          ac: {
            code: competence.nom_court,
            libelle: competence.libelle_long
          }
        };
      }
    }
    
    return null;
  }
}

export { MondeView };