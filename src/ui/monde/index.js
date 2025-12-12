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


  getInfo(element) {
    
    const id = element.id;
    
    if (!id) return null;
    

    for (let competence of Object.values(this.donnees)) {
      if (competence.nom_court === id) {
        
       
        const niveauMoyen = Math.round((competence.niveaux.length / 3) * 100);
        localStorage.setItem("coin", niveauMoyen);
        
     
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