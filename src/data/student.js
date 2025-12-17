

import data from '../data/student.json';

let student = {};

student.data = data;
student.history = {}; // objet pour stocker l'historique par code
student.notes = {}; // objet pour stocker les notes par code

student.getCoin = function(acCode) {
    return student.data[acCode] || 0;
}

student.setCoin = function(acCode, coins) {
    student.data[acCode] = coins;
    
}

student.getHistory = function(acCode) {
    return student.history[acCode] || [];
}

student.addHistory = function(acCode, oldLevel, newLevel) {
    if (!student.history[acCode]) {
        student.history[acCode] = [];
    }
    student.history[acCode].push({
        ac: acCode,
        date: Date.now(),
        oldLevel: oldLevel,
        newLevel: newLevel
    });
}

student.getNotes = function(acCode) {
    return student.notes[acCode] || '';
}

student.setNotes = function(acCode, notes) {
    student.notes[acCode] = notes;
}

student.saveToLocalStorage = function() {
    localStorage.setItem('studentData', JSON.stringify(student.data));
    localStorage.setItem('studentHistory', JSON.stringify(student.history));
    localStorage.setItem('studentNotes', JSON.stringify(student.notes));
}

student.loadFromLocalStorage = function() {
    const savedData = localStorage.getItem('studentData');
    if (savedData) {
        student.data = JSON.parse(savedData);
    }
    const savedHistory = localStorage.getItem('studentHistory');
    if (savedHistory) {
        student.history = JSON.parse(savedHistory);
    }
    const savedNotes = localStorage.getItem('studentNotes');
    if (savedNotes) {
        student.notes = JSON.parse(savedNotes);
    }
}

student.loadFromLocalStorage(); 

export default student;