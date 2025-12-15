import template from "./template.html?raw";
import { htmlToDOM } from "@/lib/utils.js";



/**
 * Construit et retourne le layout principal de l'application.
 *
 * @function
 * @returns {DocumentFragment} Le fragment DOM représentant le layout complet.
 *
 * @description
 * - Crée un fragment DOM à partir du template HTML.
 * - Retourne le fragment DOM finalisé.
 */
export function RootLayout() {
    let layout = htmlToDOM(template);
    return layout;
}