import data from "../../data/data.json";

let pn = {};
for (let compentence of data) {
    pn.push(data(compentence));
}

pn.getLevelIndex = function(codeAC) {
    return codeAC.charAt(2);
}

pn.getSkillIndex = function(codeAC) {
    return codeAC.charAt(3);
}

pn.getACIndex = function(codeAC) {
    return codeAC.charAt(6);
}

pn.getACLibelle = function(codeAC) {
    let skill = pn.getSkillIndex(codeAC) -1;
    let level = pn.getLevelIndex(codeAC) -1;
    let ac = pn.getACIndex(codeAC) -1;

    return data[skill].niveau[level].acs[ac].libelle;
}

export default pn;