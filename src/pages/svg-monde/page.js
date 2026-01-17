import { FlowerView } from "@/ui/flower";
import { MondeView } from "@/ui/monde";
import { PopupInfo } from "@/ui/popup-info";
import "@/ui/popup-info/style.css";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import data from "../../data/data.json";
import studentData from "../../data/student.json";
import gsap from "gsap";
import { Animation } from "@/lib/animation.js";


let M = {}
M.donnees = data;
M.student = studentData;

M.getNiveau = function (code) {
  return +localStorage.getItem('coin_' + code) || 0;
}

M.setNiveau = function (code, niveau) {
  localStorage.setItem('coin_' + code, niveau);
}

M.getHistory = function (code) {
  const historyKey = 'history_' + code;
  return JSON.parse(localStorage.getItem(historyKey) || '[]');
}

M.addHistory = function (code, oldLevel, newLevel) {
  const historyKey = 'history_' + code;
  const history = M.getHistory(code);
  history.push({
    ac: code,
    date: Date.now(),
    oldLevel: oldLevel,
    newLevel: newLevel
  });
  localStorage.setItem(historyKey, JSON.stringify(history));
}

M.calculateBorderColor = function (niveau) {
  const maxCoins = 5;
  const goldCoins = Math.round((niveau / 100) * maxCoins);
  
  if (goldCoins === 0){
    return null;
  }
  if (goldCoins <= 2) {
    return '#ff0000';
  } else if (goldCoins <= 4) {
    return '#ffff00';
  } else {
    return '#00ff00';
  }
}

M.findCompetence = function (nomCourt) {
  for (let key in M.donnees) {
    const competence = M.donnees[key];
    if (competence.nom_court === nomCourt) {
      return competence;
    }
  }
  return null;
}

M.calculateSaturation = function (moyenne) {
  const maxMoyenne = 100;
  const ratio = moyenne / maxMoyenne;

  let saturation;
  if (ratio <= 0.4) {
    saturation = ratio * 0.5;
  } else if (ratio <= 0.8) {
    saturation = 0.2 + (ratio - 0.4) * 1.5;
  } else {
    saturation = 0.8 + (ratio - 0.8) * 1.0;
  }
  
  return saturation;
}

M.getACInfo = function (element) {
  const id = element.id;
  if (!id) return null;
  
  for (let competence of Object.values(M.donnees)) {
    for (let niveau of competence.niveaux) {
      for (let ac of niveau.acs) {
        if (ac.code === id) {
          return {
            competence: competence.nom_court,
            niveau: Math.round((niveau.ordre / 3) * 100),
            ac: ac
          };
        }
      }
    }
  }
  return null;
}

M.getCompetenceInfo = function (element) {
  const id = element.id;
  if (!id) return null;
  
  for (let competence of Object.values(M.donnees)) {
    if (competence.nom_court === id) {
      const niveauMoyen = Math.round((competence.niveaux.length / 3) * 100);
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



let C = {};

C.handler_click = function (ev) {

  const groupeFlower = ev.target.closest('g[data-type="AC"]');
  if (groupeFlower) {
    console.log("AC détecté!", groupeFlower);
    ev.stopPropagation();
    const infos = M.getACInfo(groupeFlower);
    if (infos) {
      V.popup.afficher(infos);
    }
  }
};


C.handler_clickMonde = function (ev) {
  const groupe = ev.target.closest('g[data-type="competence"]');
  if (groupe) {
    console.log("Click détecté monde !", groupe);
    ev.stopPropagation();
    const infos = M.getCompetenceInfo(groupe);
    if (infos) {
      V.popup.afficher(infos, true);
    }
  }
};

C.handler_hoverMonde = function (ev) {
  const groupe = ev.target.closest('g[data-type="competence"]');
  if (groupe) {
    V.showHoverLabel(groupe.id, ev.clientX, ev.clientY);
    V.animateGroupHover(groupe, true);
  }
};

C.handler_hoverOutMonde = function (ev) {
  const groupe = ev.target.closest('g[data-type="competence"]');
  if (groupe) {
    V.hideHoverLabel();
    V.animateGroupHover(groupe, false);
  }
};

C.handler_mouseMoveMonde = function (ev) {
  const groupe = ev.target.closest('g[data-type="competence"]');
  if (groupe) {
    V.updateHoverPosition(ev.clientX, ev.clientY);
  }
};

C.init = function () {
  V.rootPage = htmlToDOM(template);
  V.flowers = new FlowerView();
  V.monde = new MondeView();
  V.popup = new PopupInfo(M, C.updateACStyle, C.zoomToCompetence);
  V.rootPage.querySelector('slot[name="flower-svg"]').replaceWith(V.flowers.dom());
  V.rootPage.querySelector('slot[name="monde-svg"]').replaceWith(V.monde.dom());
  C.attachEvents();
  C.initAllStyles();
  
  // Masquer la carte au démarrage
  V.flowers.dom().style.display = 'none';
  V.rootPage.querySelector('#reset-zoom').style.display = 'block';
  V.repositionMonde(true);
  
  // Animation pop des mondes au démarrage
  V.animateMondesEntree();
  
  return V.rootPage;
}

C.attachEvents = function () {
  V.rootPage.addEventListener("click", C.handler_click);
  V.rootPage.addEventListener("click", C.handler_clickMonde);
  V.rootPage.querySelector('#reset-zoom').addEventListener('click', C.resetZoom);
  V.monde.dom().addEventListener('mouseenter', C.handler_hoverMonde, true);
  V.monde.dom().addEventListener('mouseleave', C.handler_hoverOutMonde, true);
  V.monde.dom().addEventListener('mousemove', C.handler_mouseMoveMonde, true);
}

C.initAllStyles = function () {
  const allAC = V.rootPage.querySelectorAll('g[data-type="AC"]');
  for (let i = 0; i < allAC.length; i++) {
    const ac = allAC[i];
    const code = ac.id;
    const niveau = M.getNiveau(code);
    const borderColor = M.calculateBorderColor(niveau);
    V.applyACStyle(ac, borderColor);
  }
  
  C.updateMondeStyles();
}

C.updateMondeStyles = function () {
  const allCompetences = V.monde.dom().querySelectorAll('g[data-type="competence"]');
  for (let i = 0; i < allCompetences.length; i++) {
    const competence = allCompetences[i];
    const niveau = M.getNiveau(competence.id);
    const saturation = M.calculateSaturation(niveau);
    V.applyCompetenceSaturation(competence, saturation);
  }
}

C.updateACStyle = function (code) {
  const ACGroup = V.rootPage.querySelector('g[id="' + code + '"][data-type="AC"]');
  if (ACGroup) {
    const niveau = M.getNiveau(code);
    const borderColor = M.calculateBorderColor(niveau);
    V.applyACStyle(ACGroup, borderColor);
  }
  C.updateMondeStyles();
}

C.zoomToCompetence = function (competenceId) {
  // Afficher la carte et le bouton reset
  V.flowers.dom().style.display = 'block';
  V.rootPage.querySelector('#reset-zoom').style.display = 'block';
  V.repositionMonde(false);
  V.zoomToCompetence(competenceId);
  
  // Animation d'entrée pour les AC de la compétence
  V.animateACEntree(competenceId);
}

C.resetZoom = function () {
  V.resetZoom();
  // Afficher carte et monde ensemble
  V.flowers.dom().style.display = 'block';
  V.monde.dom().style.display = 'block';
  V.rootPage.querySelector('#reset-zoom').style.display = 'block';
  V.repositionMonde(false);
}


let V = {
  rootPage: null,
  flowers: null,
  monde: null,
  popup: null
};

V.applyACStyle = function (element, borderColor) {
  if (borderColor === null) {
    element.style.filter = '';
  } else {
    element.style.filter = 'drop-shadow(0 0 4px ' + borderColor + ') drop-shadow(0 0 8px ' + borderColor + ')';
  }
}

V.showHoverLabel = function (text, x, y) {
  if (!V.hoverLabel) {
    V.hoverLabel = document.createElement('div');
    V.hoverLabel.className = 'monde-hover-label';
    document.body.appendChild(V.hoverLabel);
  }
  V.hoverLabel.textContent = text;
  V.hoverLabel.style.display = 'block';
  V.updateHoverPosition(x, y);
}

V.updateHoverPosition = function (x, y) {
  if (V.hoverLabel) {
    V.hoverLabel.style.left = x + 15 + 'px';
    V.hoverLabel.style.top = y + 15 + 'px';
  }
}

V.hideHoverLabel = function () {
  if (V.hoverLabel) {
    V.hoverLabel.style.display = 'none';
  }
}

V.animateGroupHover = function (element, status) {
  gsap.killTweensOf(element);
  if (status) {
    gsap.to(element, {
      duration: 0.3,
      y: -5,
      scale: 1.05,
      ease: "power2.out"
    });
  } else {
    gsap.to(element, {
      duration: 0.3,
      y: 0,
      scale: 1,
      ease: "power2.out"
    });
  }
}

V.applyCompetenceSaturation = function (element, saturation) {
  const gray = 1 - saturation;
  if (saturation >= 0.99) {
    gsap.to(element, {
      duration: 0.5,
      filter: 'grayscale(0)'
    });
  } else {
    gsap.to(element, {
      duration: 0.5,
      filter: 'grayscale(' + gray + ')'
    });
  }
}

V.repositionMonde = function (centrer) {
  const container = V.rootPage.querySelector('.svg-monde-container');
  if (centrer) {
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.display = 'flex';
    container.style.height = '100vh';
  } else {
    container.style.justifyContent = '';
    container.style.alignItems = '';
    container.style.display = '';
    container.style.height = '';
  }
}

V.animateMondesEntree = function () {
  const mondeSvg = V.monde.dom();
  const allCompetences = mondeSvg.querySelectorAll('g[data-type="competence"]');
  
  // Permettre le débordement pendant l'animation
  mondeSvg.style.overflow = 'visible';
  
  gsap.set(allCompetences, {
    y: 200,
    scale: 0,
    opacity: 0
  });
  
  gsap.to(allCompetences, {
    y: 0,
    scale: 1,
    opacity: 1,
    duration: 0.8,
    ease: "back.out(1.7)",
    stagger: {
      amount: 0.6,
      from: "start"
    }
  });
}

V.animateACEntree = function (competenceId) {
  const svg = V.flowers.dom();
  const groupeZoom = svg.querySelector('#' + competenceId);
  
  if (!groupeZoom) return;
  
  // Permettre le débordement pendant l'animation
  svg.style.overflow = 'visible';
  
  // Récupérer uniquement les AC dans ce groupe de compétence
  const allAC = groupeZoom.querySelectorAll('g[data-type="AC"]');
  
  gsap.set(allAC, {
    y: 20,
    scale: 0.95,
    opacity: 0
  });
  
  gsap.to(allAC, {
    y: 0,
    scale: 1,
    opacity: 1,
    duration: 0.6,
    ease: "power3.out",
    stagger: 0.04
  });
}

V.zoomToCompetence = function (competenceId) {
  const svg = V.flowers.dom();
  const groupeZoom = svg.querySelector('#' + competenceId);
  
  if (!groupeZoom) return;
  
  const allGroups = svg.querySelectorAll('g');
  for (let i = 0; i < allGroups.length; i++) {
    allGroups[i].style.display = 'none';
  }
  
  groupeZoom.style.display = 'block';
  const subGroups = groupeZoom.querySelectorAll('g');
  for (let i = 0; i < subGroups.length; i++) {
    subGroups[i].style.display = 'block';
  }
  
  const bbox = groupeZoom.getBBox();
  const padRatio = 0.15;
  const padX = bbox.width * padRatio;
  const padY = bbox.height * padRatio;
  const newViewBox = (bbox.x - padX) + ' ' + (bbox.y - padY) + ' ' + (bbox.width + padX * 2) + ' ' + (bbox.height + padY * 2);
  svg.setAttribute('viewBox', newViewBox);
}

V.resetZoom = function () {
  const svg = V.flowers.dom();
  const allGroups = svg.querySelectorAll('g');
  for (let i = 0; i < allGroups.length; i++) {
    allGroups[i].style.display = 'block';
  }
  svg.setAttribute('viewBox', '0 0 2744.98 910.14');
}

export function SvgMondePage() {
  return C.init();
}