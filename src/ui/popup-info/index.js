import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

class PopupInfo {

  constructor(modele, onUpdate, onZoom) {
    this.root = htmlToDOM(template);
    this.modele = modele;
    this.onUpdate = onUpdate;
    this.onZoom = onZoom;
    this.attachEvents();
  }

  afficher(infos, zoom) {
    this.currentCode = infos.ac.code;
    this.zoom = zoom || false;
    this.root.querySelector('.popup-code').textContent = infos.ac.code;
    this.root.querySelector('.popup-libelle').textContent = infos.ac.libelle;
    
    const niveau = this.modele.getNiveau(infos.ac.code);
    
    const niveauValue = this.root.querySelector('#niveau-value');
    niveauValue.textContent = niveau;
    
    this.renderCoins(niveau);
    this.afficherHistorique();
    
    if (this.zoom) {
      this.afficherBoutonZoom();
    } else {
      this.cacherBoutonZoom();
    }
    
    if (this.onUpdate) {
      this.onUpdate(this.currentCode);
    }
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
        const oldLevel = this.modele.getNiveau(this.currentCode);
        const newLevel = (coinNumber / maxCoins) * 100;
        
        this.modele.setNiveau(this.currentCode, newLevel);
        this.modele.addHistory(this.currentCode, oldLevel, newLevel);
        
        const niveauValue = this.root.querySelector('#niveau-value');
        niveauValue.textContent = newLevel;
        
        this.renderCoins(newLevel);
        this.afficherHistorique();
        if (this.onUpdate) {
          this.onUpdate(this.currentCode);
        }
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

  afficherBoutonZoom() {
    let boutonZoom = this.root.querySelector('#bouton-zoom');
    if (!boutonZoom) {
      boutonZoom = document.createElement('button');
      boutonZoom.id = 'bouton-zoom';
      boutonZoom.textContent = 'Voir la section';
      boutonZoom.className = 'popup-bouton-zoom';
      boutonZoom.addEventListener('click', () => {
        if (this.onZoom) {
          this.onZoom(this.currentCode);
          this.fermer();
        }
      });
      const coinsContainer = this.root.querySelector('#ac-coins');
      coinsContainer.parentNode.insertBefore(boutonZoom, coinsContainer.nextSibling);
    }
    boutonZoom.style.display = 'block';
  }

  cacherBoutonZoom() {
    const boutonZoom = this.root.querySelector('#bouton-zoom');
    if (boutonZoom) {
      boutonZoom.style.display = 'none';
    }
  }

  afficherHistorique() {
    const container = this.root.querySelector('#historique-container');
    const history = this.modele.getHistory(this.currentCode);
    
    if (history.length === 0) {
      container.innerHTML = '<p>Aucun historique</p>';
      return;
    }
    
    container.innerHTML = '<h3>Historique</h3>';
    
    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      const elapsed = Date.now() - entry.date;
      const seconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      let timeText;
      if (days > 0) {
        timeText = 'Il y a ' + days + ' jour(s)';
      } else if (hours > 0) {
        timeText = 'Il y a ' + hours + ' heure(s)';
      } else if (minutes > 0) {
        timeText = 'Il y a ' + minutes + ' minute(s)';
      } else {
        timeText = 'Il y a ' + seconds + ' seconde(s)';
      }
      
      const div = document.createElement('div');
      div.className = 'history-entry';
      
      const spanDate = document.createElement('span');
      spanDate.textContent = timeText + ' - ';
      
      const spanNiveau = document.createElement('span');
      spanNiveau.textContent = entry.oldLevel + '% → ' + entry.newLevel + '%';
      div.appendChild(spanDate);
      div.appendChild(spanNiveau);
      container.appendChild(div);
    }
  }

}

export { PopupInfo };

