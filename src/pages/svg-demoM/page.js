import { MondeView } from "@/ui/monde";
import { PopupInfo } from "@/ui/popup-info";
import "@/ui/popup-info/style.css";
import { htmlToDOM } from "@/lib/utils.js";
import template from "./template.html?raw";

let C = {};

C.handler_click = function(ev) {
    // Trouver le groupe de compétence cliqué en utilisant l'ID
    const groupe = ev.target.closest('g[id]');
    
    if (groupe) {
        // Récupérer les infos de la compétence depuis le JSON
        const infos = V.monde.getInfo(groupe);
        
        if (infos) {
            // Afficher le popup avec les infos de la compétence
            V.popup.afficher(infos);
        }
    }
};

C.init = function() {
  return V.init();
}


let V = {
  rootPage: null,
  popup: null
};

V.init = function() {
  V.rootPage = htmlToDOM(template);
  V.monde = new MondeView();
  V.popup = new PopupInfo();
  V.rootPage.querySelector('slot[name="svg"]').replaceWith( V.monde.dom() );
  V.attachEvents();
  return V.rootPage;
};

V.attachEvents = function() {
    V.rootPage.addEventListener("click", C.handler_click);
}

export function SvgDemoMPage() {
  return C.init();
}