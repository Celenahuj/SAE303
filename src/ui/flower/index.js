import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import data from "../../data/data.json";

class FlowerView {

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

  // Trouve les infos d'un élément cliqué
  getInfo(element) {
    // Récupérer l'ID de l'élément (ex: "AC14.01" ou "AC14.021")
    const id = element.id;
    
    if (!id) return null;
    
    // Chercher dans toutes les compétences
    for (let competence of Object.values(this.donnees)) {
      // Chercher dans tous les niveaux
      for (let niveau of competence.niveaux) {
        // Chercher dans tous les AC
        for (let ac of niveau.acs) {
          // Si le code correspond exactement ou si l'ID commence par le code de l'AC
          // Ex: "AC14.02" match "AC14.02", "AC14.021", "AC14.022", etc.
          if (ac.code === id) {
            // Retourner les infos
            // Le niveau (ordre) est converti en score sur 100 (ordre 1=33, 2=66, 3=100)
            return {
              competence: competence.nom_court,
              niveau: Math.round((niveau.ordre / 3) * 100),
              ac: ac
            };
          }
        }
      }
    }
    // Si rien trouvé
    return null;
  }
}

export { FlowerView };