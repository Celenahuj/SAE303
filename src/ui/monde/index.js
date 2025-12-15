import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import "./style.css";

class MondeView {

  constructor() {
    this.root = htmlToDOM(template);
  }

  html() {
    return template;
  }

  dom() {
    return this.root;
  }
}

export { MondeView };