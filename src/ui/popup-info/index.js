import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";

class PopupInfo {

  constructor(modele, onUpdate, onZoom, onCoinUpdate, onNotesUpdate) {
    this.root = htmlToDOM(template);
    this.modele = modele;
    this.onUpdate = onUpdate;
    this.onZoom = onZoom;
    this.onCoinUpdate = onCoinUpdate;
    this.onNotesUpdate = onNotesUpdate;
    this.attachEvents();
  }

  afficher(infos, zoom) {
    this.currentCode = infos.ac.code;
    this.zoom = zoom || false;
    this.root.querySelector('.popup-code').textContent = infos.ac.code;
    this.root.querySelector('.popup-libelle').textContent = infos.ac.libelle;
    this.root.querySelector('.popup-description').value = this.modele.getNotes(infos.ac.code);
    
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
      img.title = `Cliquer pour ${i + 1} pièce(s)`;

      if (i < goldCoins) {
        img.src = "/coin_or.svg";
      } else {
        img.src = "/coin_vide.svg";
      }

      img.alt = "niveau";
      
      img.addEventListener('click', (e) => {
        const coinNumber = +e.target.dataset.coinIndex;
        this.onCoinUpdate(this.currentCode, coinNumber);
      });
      
      coinContainer.appendChild(img);
    }
  }

  updateDisplay(code) {
    const niveau = this.modele.getNiveau(code);
    const niveauValue = this.root.querySelector('#niveau-value');
    niveauValue.textContent = niveau;
    this.renderCoins(niveau);
    this.afficherHistorique();
    if (this.onUpdate) {
      this.onUpdate(code);
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

    this.root.querySelector('.popup-description').addEventListener('blur', (e) => {
      if (this.onNotesUpdate) {
        this.onNotesUpdate(this.currentCode, e.target.value);
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
      const desc = this.root.querySelector('.popup-description');
      if (desc) {
        desc.parentNode.insertBefore(boutonZoom, desc.nextSibling);
      } else {
        coinsContainer.parentNode.insertBefore(boutonZoom, coinsContainer.nextSibling);
      }
    }
    boutonZoom.classList.add('popup-bouton-zoom--visible');
  }

  cacherBoutonZoom() {
    const boutonZoom = this.root.querySelector('#bouton-zoom');
    if (boutonZoom) {
      boutonZoom.classList.remove('popup-bouton-zoom--visible');
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

