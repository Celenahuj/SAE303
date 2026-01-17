import { htmlToDOM } from "../../lib/utils.js";
import template from "./template.html?raw";
import data from "../../data/data.json";
import "./style.css";

class FlowerView {

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

export { FlowerView };