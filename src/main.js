import "./global.css";
import { Router } from "./lib/router.js";

import { RootLayout } from "./layouts/root/layout.js";
import { The404Page } from "./pages/404/page.js";
import { SvgMondePage } from "./pages/svg-monde/page.js";
import { SvgDemo2Page } from "./pages/svg-demo2/page.js";
import { SvgDemo3Page } from "./pages/svg-demo3/page.js";
import { SvgDemo4Page } from "./pages/svg-demo4/page.js";
import { SvgDemo5Page } from "./pages/svg-demo5/page.js";
import { SvgDemoMPage } from "./pages/svg-demoM/page.js";

// Exemple d'utilisation avec authentification

const router = new Router("app");

router.addLayout("/", RootLayout);


router.addRoute("/", SvgMondePage);
router.addRoute("/svg-monde", SvgMondePage);

router.addRoute("/svg-demo2", SvgDemo2Page);


router.addRoute("/svg-demo3", SvgDemo3Page);
router.addRoute("/svg-demo4", SvgDemo4Page);

router.addRoute("/svg-demo5", SvgDemo5Page);

router.addRoute("/svg-demoM", SvgDemoMPage);

router.addRoute("*", The404Page);

// Démarrer le routeur
router.start();
