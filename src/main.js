import "./global.css";
import { Router } from "./lib/router.js";

import { RootLayout } from "./layouts/root/layout.js";
import { The404Page } from "./pages/404/page.js";
import { SvgMondePage } from "./pages/svg-monde/page.js";

// Gérer la redirection depuis 404.html pour les SPAs sur GitHub Pages
(function(){
  var redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect != location.href) {
    history.replaceState(null, null, redirect);
  }
})();

// Exemple d'utilisation avec authentification

const router = new Router("app");

router.addLayout("/", RootLayout);

router.addRoute("/", SvgMondePage);
router.addRoute("/svg-monde", SvgMondePage);

router.addRoute("*", The404Page);

// Démarrer le routeur
router.start();
