import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

class PopupInfo {

  constructor() {
    this.root = htmlToDOM(template);
    this.attachEvents();
  }

  afficher(infos) {
    this.currentCode = infos.ac.code;
    this.root.querySelector('.popup-code').textContent = infos.ac.code;
    this.root.querySelector('.popup-libelle').textContent = infos.ac.libelle;
    
    const niveau = +localStorage.getItem(`coin_${infos.ac.code}`) || 0;
    
    const niveauValue = this.root.querySelector('#niveau-value');
    niveauValue.textContent = niveau;
    
    this.renderCoins(niveau);
    this.root.classList.remove('hidden');
    
    if (this.root.parentNode !== document.body) {
      document.body.appendChild(this.root);
    }
  }

  renderCoins(level) {
    const coinContainer = this.root.querySelector('#ac-coins');
    coinContainer.innerHTML = "";

    const maxCoins = 5;
    const goldCoins = Math.round((level / 100) * maxCoins);

    for (let i = 0; i < maxCoins; i++) {
      const img = document.createElement("img");
      
      img.dataset.coinIndex = i + 1;
      img.style.cursor = "pointer";
      img.title = `Cliquer pour ${i + 1} pièce(s)`;

      if (i < goldCoins) {
        img.src = "/coin_or.svg";
      } else {
        img.src = "/coin_vide.svg";
      }

      img.alt = "niveau";
      
      img.addEventListener('click', (e) => {
        const coinNumber = +e.target.dataset.coinIndex;
        const newLevel = (coinNumber / maxCoins) * 100;
        
        localStorage.setItem(`coin_${this.currentCode}`, newLevel);
        
        const niveauValue = this.root.querySelector('#niveau-value');
        niveauValue.textContent = newLevel;
        
        this.renderCoins(newLevel);
      });
      
      coinContainer.appendChild(img);
    }
  }

  fermer() {
    this.root.classList.add('hidden');
  }

  attachEvents() {
    this.root.querySelector('.popup-fermer').addEventListener('click', () => {
      this.fermer();
    });
    
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) {
        this.fermer();
      }
    });
  }
}

export { PopupInfo };
