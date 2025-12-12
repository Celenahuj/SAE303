import { FlowerView } from "@/ui/flower";
import { MondeView } from "@/ui/monde";
import { PopupInfo } from "@/ui/popup-info";
import "@/ui/popup-info/style.css";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

let C = {};

C.handler_click = function (ev) {
  
  
  // Sinon, chercher un AC de fleur
  const groupeFlower = ev.target.closest('g[data-type="AC"]');
  if (groupeFlower) {
    console.log("AC détecté!", groupeFlower);
    ev.stopPropagation();
    const infos = V.flowers.getInfo(groupeFlower);
    if (infos) {
      V.popup.afficher(infos);
    }
  }
};


C.handler_clickMonde = function (ev) {
  // Chercher le groupe avec data-type="competence" en remontant
  const groupe = ev.target.closest('g[data-type="competence"]');
  if (groupe) {
    console.log("Click détecté monde !", groupe);
    ev.stopPropagation();
    const infos = V.monde.getInfo(groupe);
    if (infos) {
      V.popup.afficher(infos);
    }
  }
};

C.init = function () {
  return V.init();
}


let V = {
  rootPage: null,
  flowers: null,
  monde: null,
  popup: null
};

V.init = function () {
  V.rootPage = htmlToDOM(template);
  V.flowers = new FlowerView();
  V.monde = new MondeView();
  V.popup = new PopupInfo();
  V.rootPage.querySelector('slot[name="flower-svg"]').replaceWith(V.flowers.dom());
  V.rootPage.querySelector('slot[name="monde-svg"]').replaceWith(V.monde.dom());
  V.attachEvents();
  return V.rootPage;
};

V.attachEvents = function () {
  console.log("Attachement des événements...");
  console.log("V.rootPage:", V.rootPage);
  V.rootPage.addEventListener("click", C.handler_click);
  V.rootPage.addEventListener("click", C.handler_clickMonde);
  console.log("Événements attachés!");
}

export function SvgDemo1Page() {
  return C.init();
}