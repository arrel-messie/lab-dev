const fs = require('fs');
const path = require('path');

function getDirectoryStructure(startPath) {
    if (!fs.existsSync(startPath)) {
        console.error('Directory not found:', startPath);
        return null;
    }

    function buildStructure(currentPath) {
        const stats = fs.statSync(currentPath);
        
        if (!stats.isDirectory()) {
            return path.basename(currentPath);
        }

        const info = {};
        const items = fs.readdirSync(currentPath);

        items.forEach(item => {
            const itemPath = path.join(currentPath, item);
            
            // Skip node_modules and hidden files/directories
            if (item === 'node_modules' || item.startsWith('.')) {
                return;
            }

            if (fs.statSync(itemPath).isDirectory()) {
                info[item] = buildStructure(itemPath);
            } else {
                info[item] = 'file';
            }
        });

        return info;
    }

    return buildStructure(startPath);
}

// Create the directory structure object
const directoryStructure = {
    project: getDirectoryStructure(process.cwd())
};

// Export the directory structure object
module.exports = directoryStructure;

// Optional: Log the structure to console for visualization
console.log('Directory Structure:', directoryStructure);

// Fonction pour charger la structure depuis le système de fichiers
async function loadStructure() {
    try {
        const response = await fetch('create_structure.js');
        const text = await response.text();
        // Extraire l'objet structure du fichier
        const structureMatch = text.match(/const structure = ({[\s\S]*?});/);
        if (structureMatch) {
            return JSON.parse(structureMatch[1]);
        }
        throw new Error('Structure not found in file');
    } catch (error) {
        console.error('Error loading structure:', error);
        return null;
    }
}

// Fonction pour créer un élément de compétence
function createSkillElement(name, items = {}) {
    const skillDiv = document.createElement('div');
    skillDiv.className = 'skill-category';

    const title = document.createElement('h3');
    title.className = 'skill-category-title';
    title.textContent = name;
    skillDiv.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'skill-list';

    Object.keys(items).forEach(item => {
        const li = document.createElement('li');
        li.className = 'skill-item';
        li.textContent = item;
        list.appendChild(li);
    });

    skillDiv.appendChild(list);
    return skillDiv;
}

// Fonction pour rendre les compétences
function renderSkills(structure) {
    const skillsContainer = document.querySelector('.skills-container');
    if (!skillsContainer) return;

    // Vider le conteneur
    skillsContainer.innerHTML = '';

    // Parcourir la structure des compétences techniques
    const technicalSkills = structure["Competences techniques"];
    if (technicalSkills) {
        Object.entries(technicalSkills).forEach(([category, items]) => {
            const skillElement = createSkillElement(category, items);
            skillsContainer.appendChild(skillElement);
        });
    }
}

// Fonction pour rendre les projets
function renderProjects(structure) {
    const projectsContainer = document.querySelector('.projects-container');
    if (!projectsContainer) return;

    projectsContainer.innerHTML = '';

    // Rendre les projets MVP
    if (structure["Projets MVP"]) {
        const mvpSection = document.createElement('div');
        mvpSection.className = 'project-section';
        mvpSection.innerHTML = `<h2 class="section-subtitle">Projets MVP</h2>`;
        projectsContainer.appendChild(mvpSection);
    }

    // Rendre les projets POC
    if (structure["Projets POCs"]) {
        const pocSection = document.createElement('div');
        pocSection.className = 'project-section';
        pocSection.innerHTML = `<h2 class="section-subtitle">Projets POCs</h2>`;
        projectsContainer.appendChild(pocSection);
    }
}

// Fonction d'initialisation
async function initializePage() {
    const structure = await loadStructure();
    if (structure) {
        renderSkills(structure);
        renderProjects(structure);
    }
}

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', initializePage);
