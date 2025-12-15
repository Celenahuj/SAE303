import { FlowerView } from "@/ui/flower";
import { MondeView } from "@/ui/monde";
import { PopupInfo } from "@/ui/popup-info";
import "@/ui/popup-info/style.css";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";
import data from "../../data/data.json";
import studentData from "../../data/student.json";


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

M.calculateOpacity = function (niveau) {
  return 1;
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
  console.log("Groupe trouvé:", groupe);

  if (groupe) {
    console.log("Click détecté monde !", groupe);
    console.log("Groupe id:", groupe.id);
    ev.stopPropagation();
    const infos = M.getCompetenceInfo(groupe);
    console.log("Infos récupérées:", infos);
    if (infos) {
      V.popup.afficher(infos, true);
    } else {
      console.log("Aucune info trouvée pour ce groupe");
    }
  } else {
    console.log("Aucun groupe data-type='competence' trouvé");
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
  return V.rootPage;
}

C.attachEvents = function () {
  V.rootPage.addEventListener("click", C.handler_click);
  V.rootPage.addEventListener("click", C.handler_clickMonde);
  V.rootPage.querySelector('#reset-zoom').addEventListener('click', C.resetZoom);
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
}

C.updateACStyle = function (code) {
  const ACGroup = V.rootPage.querySelector('g[id="' + code + '"][data-type="AC"]');
  if (ACGroup) {
    const niveau = M.getNiveau(code);
    const borderColor = M.calculateBorderColor(niveau);
    V.applyACStyle(ACGroup, borderColor);
  }
}

C.zoomToCompetence = function (competenceId) {
  V.zoomToCompetence(competenceId);
}

C.resetZoom = function () {
  V.resetZoom();
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
  const pad = 50;
  const newViewBox = (bbox.x - pad) + ' ' + (bbox.y - pad) + ' ' + (bbox.width + pad * 2) + ' ' + (bbox.height + pad * 2);
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

export function SvgDemo1Page() {
  return C.init();
}