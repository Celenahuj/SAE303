import { FlowerView } from "@/ui/flower";
import { MondeView } from "@/ui/monde";
import { PopupInfo } from "@/ui/popup-info";
import "@/ui/popup-info/style.css";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import pn from "../../data/pn.js";
import student from "../../data/student.js";
import gsap from "gsap";


let M = {}
M.donnees = pn;
M.student = student;

M.getNiveau = function (code) {
  return student.getCoin(code);
}

M.setNiveau = function (code, niveau) {
  student.setCoin(code, niveau);
}

M.getHistory = function (code) {
  return student.getHistory(code);
}

M.addHistory = function (code, oldLevel, newLevel) {
  student.addHistory(code, oldLevel, newLevel);
  student.saveToLocalStorage();
}

M.getNotes = function (code) {
  return student.getNotes(code);
}

M.setNotes = function (code, notes) {
  student.setNotes(code, notes);
  student.saveToLocalStorage();
}

M.calculateBorderColor = function (niveau) {

  const maxCoins = 5;
  const goldCoins = Math.round((niveau / 100) * maxCoins);

  if (goldCoins === 0) return null;
  if (goldCoins <= 2) return 'ac-filter--red';
  if (goldCoins <= 4) return 'ac-filter--yellow';
  return 'ac-filter--green';
}

M.findCompetence = function (nomCourt) {
  return M.donnees.findCompetence(nomCourt);
}

M.getSortedHistory = function() {
  const events = [];
  for (const code in student.history) {
    student.history[code].forEach(event => {
      events.push({ ...event, code });
    });
  }
  return events.sort((a, b) => a.date - b.date); 
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

  return M.donnees.getACInfo(id);
}

M.getCompetenceInfo = function (element) {
  const id = element.id;
  if (!id) return null;

  return M.donnees.getCompetenceInfo(id);
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

C.handler_hover = function (ev) {
  const groupe = ev.target.closest('g[data-type="competence"], g[data-type="AC"]');
  if (groupe) {
    V.showHoverLabel(groupe.id, ev.clientX, ev.clientY);
    V.animateGroupHover(groupe, true);
  }
};

C.handler_hoverOut = function (ev) {
  const groupe = ev.target.closest('g[data-type="competence"], g[data-type="AC"]');
  if (groupe) {
    V.hideHoverLabel();
    V.animateGroupHover(groupe, false);
  }
};

C.handler_mouseMove = function (ev) {
  const groupe = ev.target.closest('g[data-type="competence"], g[data-type="AC"]');
  if (groupe) {
    V.updateHoverPosition(ev.clientX, ev.clientY);
  }
};

C.handler_export = function () {
  console.log('Export button clicked');
  M.exportSauvegarde();
}

C.handler_import = function (ev) {
  console.log('Import input changed', ev.target.files);
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.coins) student.data = data.coins;
      if (data.history) student.history = data.history;
      if (data.notes) student.notes = data.notes;
      student.saveToLocalStorage();
      
      C.initAllStyles();
      C.buildHistoryTimeline();
      console.log('Données importées avec succès');
    } catch (err) {
      console.error('Erreur lors de l\'importation du JSON', err);
    }
  };
  reader.readAsText(file);
}

C.updateCoin = function (code, coinNumber) {
  const oldLevel = M.getNiveau(code);
  const newLevel = (coinNumber / 5) * 100;
  M.setNiveau(code, newLevel);
  M.addHistory(code, oldLevel, newLevel);
  C.buildHistoryTimeline();
  V.popup.updateDisplay(code);
}

C.updateNotes = function (code, notes) {
  M.setNotes(code, notes);
}

C.init = function () {
  V.rootPage = htmlToDOM(template);
  V.flowers = new FlowerView();
  V.monde = new MondeView();
  V.popup = new PopupInfo(M, C.updateACStyle, C.zoomToCompetence, C.updateCoin, C.updateNotes);
  V.rootPage.querySelector('slot[name="flower-svg"]').replaceWith(V.flowers.dom());
  V.rootPage.querySelector('slot[name="monde-svg"]').replaceWith(V.monde.dom());
  C.attachEvents();
  C.initAllStyles();

  C.buildHistoryTimeline();

  // Masquer la carte au démarrage
  V.flowers.dom().classList.add('hidden');
  V.rootPage.querySelector('#reset-zoom').classList.remove('hidden');
  V.repositionMonde(true);

  // Animation pop des mondes au démarrage
  V.animateMondesEntree();

  // Branchement du bouton d'export
  const exportBtn = V.rootPage.querySelector('#export-save');
  console.log('Export button element:', exportBtn);
  if (exportBtn) {
    exportBtn.addEventListener('click', C.handler_export);
    console.log('Export event attached');
  } else {
    console.log('Export button not found');
  }

  // Branchement de l'input d'import
  const importInput = V.rootPage.querySelector('#import-save');
  console.log('Import input element:', importInput);
  if (importInput) {
    importInput.style.pointerEvents = 'auto';
    importInput.addEventListener('change', C.handler_import);
    console.log('Import event attached');
  } else {
    console.log('Import input not found');
  }

  // Slider pour l'historique
  const slider = V.rootPage.querySelector('#history-slider');
  const dateSpan = V.rootPage.querySelector('#slider-date');
  if (slider) {
    slider.addEventListener('input', (e) => {
      const index = parseInt(e.target.value);
      const historiquetrier = M.getSortedHistory();
      const tempData = {};
      for (let i = 0; i < index; i++) {
        tempData[historiquetrier[i].code] = historiquetrier[i].newLevel;
      }
      student.data = tempData;
      C.initAllStyles();
      if (index === 0) {
        dateSpan.textContent = 'Début';
      } else if (index === historiquetrier.length) {
        dateSpan.textContent = 'Maintenant';
      } else {
        const date = new Date(historiquetrier[index - 1].date);
        dateSpan.textContent = date.toLocaleDateString('fr-FR');
      }
    });
  }

  return V.rootPage;
}

C.attachEvents = function () {
  V.rootPage.addEventListener("click", C.handler_click);
  V.rootPage.addEventListener("click", C.handler_clickMonde);
  const resetBtn = V.rootPage.querySelector('#reset-zoom');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => { V.resetZoom(); });
  }
  V.monde.dom().addEventListener('mouseenter', C.handler_hover, true);
  V.monde.dom().addEventListener('mouseleave', C.handler_hoverOut, true);
  V.monde.dom().addEventListener('mousemove', C.handler_mouseMove, true);
  V.flowers.dom().addEventListener('mouseenter', C.handler_hover, true);
  V.flowers.dom().addEventListener('mouseleave', C.handler_hoverOut, true);
  V.flowers.dom().addEventListener('mousemove', C.handler_mouseMove, true);
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

C.buildHistoryTimeline = function () {
  const history = M.getSortedHistory();
  const slider = V.rootPage.querySelector('#history-slider');
  const dateSpan = V.rootPage.querySelector('#slider-date');
  if (history.length === 0) {
    if (slider) {
      slider.status = true;
    }
    if (dateSpan) dateSpan.textContent = 'Aucune donnée';
    return;
  }
  if (slider) {
    slider.status = false;
    slider.max = history.length;
    slider.value = history.length; 
  }
  if (dateSpan) dateSpan.textContent = 'Maintenant';
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

C.updateNotes = function (code, notes) {
  M.setNotes(code, notes);
}

C.zoomToCompetence = function (competenceId) {
  // Afficher la carte et le bouton reset
  V.flowers.dom().classList.remove('hidden');
  V.rootPage.querySelector('#reset-zoom').classList.remove('hidden');
  V.repositionMonde(false);
  V.zoomToCompetence(competenceId);
  
  // Animation d'entrée pour les AC de la compétence
  V.animateACEntree(competenceId);
}

M.exportSauvegarde = function () {
  console.log('Starting export');
  const data = { coins: student.data, history: student.history, notes: student.notes };
  console.log('Data to export:', data);

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "sauvegarde_SAE303.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log('Export completed');
};


let V = {
  rootPage: null,
  flowers: null,
  monde: null,
  popup: null
};

V.applyACStyle = function (element, borderColor) {

  element.classList.remove('ac-filter--red', 'ac-filter--yellow', 'ac-filter--green');
  element.style.filter = '';
  if (borderColor) element.classList.add(borderColor);
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

V.applyGroupOpacity = function (element, opacity) {
  
  gsap.to(element, {
    duration: 0.35,
    opacity: opacity,
    ease: 'power1.out'
  });
}
V.repositionMonde = function (centrer) {
  const container = V.rootPage.querySelector('.svg-monde-container');
  
  if (container) {
    if (centrer) {
      container.classList.add('is-centered');
    } else {
      container.classList.remove('is-centered');
    }
  }
};

V.animateMondesEntree = function () {
  const mondeSvg = V.monde.dom();
  const allCompetences = mondeSvg.querySelectorAll('g[data-type="competence"]');

  // Permettre le débordement pendant l'animation
  mondeSvg.classList.add('overflow-visible');

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
  svg.classList.add('overflow-visible');

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

V.animateAllACEntree = function () {
  const svg = V.flowers.dom();

  // Permettre le débordement pendant l'animation
  svg.classList.add('overflow-visible');

  // Récupérer toutes les AC
  const allAC = svg.querySelectorAll('g[data-type="AC"]');

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
    allGroups[i].classList.add('hidden');
  }

  groupeZoom.classList.remove('hidden');
  const subGroups = groupeZoom.querySelectorAll('g');
  for (let i = 0; i < subGroups.length; i++) {
    subGroups[i].classList.remove('hidden');
  }

  const bbox = groupeZoom.getBBox();
  const padRatio = 0.10;
  const padX = bbox.width * padRatio;
  const padY = bbox.height * padRatio;
  let newViewBox = (bbox.x - padX) + ' ' + (bbox.y - padY) + ' ' + (bbox.width + padX * 2) + ' ' + (bbox.height + padY * 2);

  // Définir des viewBox spécifiques pour certains groupes
  if (competenceId === 'Exprimer') {
    newViewBox = '-105 25 1019 1171';
    svg.style.width = '80%';
  } else if (competenceId === 'Développer') {
    svg.style.width = '100%';
    newViewBox = '285 -0 1416 556';
  } else if (competenceId === 'Entreprendre') {
    svg.style.width = '104%';
    newViewBox = '1456 460 1394 910';
  } else if (competenceId === 'Concevoir') {
    svg.style.width = '100%';
    newViewBox = '1466 -0 1392 555';
  } else if (competenceId === 'Comprendre') {
    newViewBox = '677 460 1022 570';
    svg.style.width = '75%';
  }


console.log("Nouveau viewBox :", newViewBox);
svg.setAttribute('viewBox', newViewBox);
}

V.resetZoom = function () {
  const svg = V.flowers.dom();
  const allGroups = svg.querySelectorAll('g');
  for (let i = 0; i < allGroups.length; i++) {
    allGroups[i].classList.remove('hidden');
  }
  svg.setAttribute('viewBox', '0 0 2744.98 910.14');
  svg.classList.remove('hidden'); 
  svg.style.width = '100%';

  V.repositionMonde(false); 

  // Animation d'entrée pour toutes les AC
  V.animateAllACEntree();
}
export function SvgMondePage() {
  return C.init();
}