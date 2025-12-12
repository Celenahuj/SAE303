import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

class PopupInfo {

  constructor() {
    this.root = htmlToDOM(template);
    this.attachEvents();
  }

  // Affiche le popup avec les infos
  afficher(infos) {
    console.log('🔵 afficher() appelé avec:', infos);
    console.log('🔵 this.root:', this.root);
    
    // Remplir les données
    this.root.querySelector('.popup-code').textContent = infos.ac.code;
    this.root.querySelector('.popup-libelle').textContent = infos.ac.libelle;
    
    // Mettre à jour l'affichage du niveau
    const valueDisplay = this.root.querySelector('#niveau-value');
    valueDisplay.textContent = infos.niveau;
    
    console.log('🔵 Appel de renderCoins avec niveau:', infos.niveau);
    // Afficher les pièces selon le niveau
    this.renderCoins(infos.niveau);
    
    // Rendre le popup visible
    this.root.classList.remove('hidden');
    
    // Ajouter au body seulement s'il n'est pas déjà dans le document
    if (this.root.parentNode !== document.body) {
      console.log('🔵 Ajout du popup au body');
      document.body.appendChild(this.root);
    } else {
      console.log('🔵 Popup déjà dans le body');
    }
  }

  // Affiche les pièces en fonction du niveau
  renderCoins(level) {
    console.log('🟡 renderCoins() appelé avec level:', level);
    const coinContainer = this.root.querySelector('#ac-coins');
    console.log('🟡 coinContainer:', coinContainer);
    coinContainer.innerHTML = "";

    const maxCoins = 5;
    const goldCoins = Math.round((level / 100) * maxCoins);
    console.log('🟡 goldCoins calculé:', goldCoins, 'sur', maxCoins);

    for (let i = 0; i < maxCoins; i++) {
      const img = document.createElement("img");
      
      // Ajouter un attribut data pour identifier la position de la pièce
      img.dataset.coinIndex = i + 1;
      img.style.cursor = "pointer";
      img.title = `Cliquer pour ${i + 1} pièce(s)`;

      if (i < goldCoins) {
        // pièce dorée
        img.src = "/src/ui/popup-info/coin_or.svg";
        console.log('🟡 Pièce dorée', i + 1);
      } else {
        // pièce manquante = cercle blanc avec contour
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                       <circle cx="32" cy="32" r="30" fill="white" stroke="#8a5a32" stroke-width="4"/>
                     </svg>`;
        img.src = "data:image/svg+xml;base64," + btoa(svg);
        console.log('🟡 Pièce vide', i + 1);
      }

      img.alt = "niveau";
      
      // Ajouter l'événement click sur chaque pièce
      img.addEventListener('click', (e) => {
        const coinNumber = parseInt(e.target.dataset.coinIndex);
        const newLevel = (coinNumber / maxCoins) * 100;
        
        // Mettre à jour l'affichage du niveau
        const valueDisplay = this.root.querySelector('#niveau-value');
        valueDisplay.textContent = newLevel;
        
        // Re-render les pièces
        this.renderCoins(newLevel);
      });
      
      coinContainer.appendChild(img);
    }
  }

  // Ferme le popup
  fermer() {
    console.log('🔴 fermer() appelé');
    this.root.classList.add('hidden');
    console.log('🔴 Classes après add("hidden"):', this.root.classList);
  }

  // Attache les événements
  attachEvents() {
    // Fermer avec le bouton
    this.root.querySelector('.popup-fermer').addEventListener('click', () => {
      this.fermer();
    });
    
    // Fermer en cliquant sur le fond
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) {
        this.fermer();
      }
    });
  }
}

export { PopupInfo };
