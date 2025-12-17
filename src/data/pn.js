import data from "./data.json";

// Convertir l'objet data en tableau indexé pour accès direct
let pn = Object.values(data);

// Fonctions d'extraction des indices depuis un code AC
pn.getLevelIndex = function(codeAC) {
    return codeAC.charAt(2);
}

pn.getSkillIndex = function(codeAC) {
    return codeAC.charAt(3);
}

pn.getACIndex = function(codeAC) {
    return codeAC.substring(6);
}

// Obtenir le libellé d'un AC à partir de son code (ex: "AC11.01")
pn.getACLibelle = function(codeAC) {
    let skill = pn.getSkillIndex(codeAC) - 1;
    let level = pn.getLevelIndex(codeAC) - 1;
    let ac = parseInt(pn.getACIndex(codeAC)) - 1;

    return pn[skill].niveaux[level].acs[ac].libelle;
}

// Obtenir toutes les infos d'un AC depuis son code
pn.getACInfo = function(codeAC) {
    let skill = pn.getSkillIndex(codeAC) - 1;
    let level = pn.getLevelIndex(codeAC) - 1;
    let ac = parseInt(pn.getACIndex(codeAC)) - 1;

    let competence = pn[skill];
    let niveau = competence.niveaux[level];
    
    return {
        competence: competence.nom_court,
        niveau: Math.round((niveau.ordre / 3) * 100),
        ac: niveau.acs[ac]
    };
}

// Trouver une compétence par son nom court
pn.findCompetence = function(nomCourt) {
    for (let i = 0; i < pn.length; i++) {
        if (pn[i].nom_court === nomCourt) {
            return pn[i];
        }
    }
    return null;
}

// Obtenir les infos d'une compétence par son nom court
pn.getCompetenceInfo = function(nomCourt) {
    let competence = pn.findCompetence(nomCourt);
    if (!competence) return null;
    
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

export default pn;