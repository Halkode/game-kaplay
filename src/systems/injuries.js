// injurySystem.js

// Constants for body parts and injury types
const BODY_PARTS = [
    'head',
    'chest',
    'arms',
    'legs'
];

const INJURY_TYPES = [
    'laceration',
    'bruise',
    'fracture'
];

// Initialize injury status
let injuryStatus = {};

// Function to initialize injuries for a character
function initializeInjuries(character) {
    injuryStatus[character.id] = {};
    BODY_PARTS.forEach(part => {
        injuryStatus[character.id][part] = null;
    });
}

// Function to apply damage
function applyDamage(character, part, injuryType, severity) {
    if (BODY_PARTS.includes(part) && INJURY_TYPES.includes(injuryType)) {
        injuryStatus[character.id][part] = { injuryType, severity };
        console.log(`${character.name} has sustained a ${severity} ${injuryType} on the ${part}.`);
    } else {
        console.error('Invalid body part or injury type.');
    }
}

// Function to update injury status
function updateInjuryStatus(character, part, status) {
    if (injuryStatus[character.id] && injuryStatus[character.id][part]) {
        injuryStatus[character.id][part].status = status;
    }
}

// Function to track consciousness
function trackConsciousness(character) {
    let conscious = true;
    let injuryParts = Object.keys(injuryStatus[character.id]).filter(part => injuryStatus[character.id][part]);
    if (injuryParts.length > 1) {
        conscious = false; // lose consciousness if injured in more than one area
    }
    return conscious;
}

// Helper functions for interactions and narrative modifications
function describeInjury(character, part) {
    const injury = injuryStatus[character.id][part];
    if (injury) {
        console.log(`Character ${character.name} has a ${injury.severity} ${injury.injuryType} on their ${part}.`);
    }
}

function narrativeInjury(character, part) {
    const injury = injuryStatus[character.id][part];
    if (injury) {
        return `${character.name} grips their ${part} in pain, suffering a ${injury.injuryType}.`;
    }
    return '';
}

// Exporting the functions for use in other modules
module.exports = {
    initializeInjuries,
    applyDamage,
    updateInjuryStatus,
    trackConsciousness,
    describeInjury,
    narrativeInjury
};