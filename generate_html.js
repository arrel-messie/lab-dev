const fs = require('fs');
const path = require('path');

// Charger la structure depuis create_structure.js
const structureContent = fs.readFileSync('create_structure.js', 'utf8');
const structureMatch = structureContent.match(/const structure = ({[\s\S]*?});/);
const structure = JSON.parse(structureMatch[1]);

// Lire le template HTML
let htmlContent = fs.readFileSync('index.html', 'utf8');

// Définir les icônes pour chaque catégorie
const categoryIcons = {
    "Langages de programmation": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3M3 16v3a2 2 0 0 0 2 2h3m8-2h3a2 2 0 0 0 2-2v-3"/>
        <path d="M12 12l-6-6 6-6 6 6-6 6z"/>
    </svg>`,
    "Frameworks": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
    </svg>`,
    "Bibliothèques": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>`,
    "Outils de Test  et qualité logiciel": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`,
    "Outils dev sec ops": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
    </svg>`,
    "Outils cloud": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
    </svg>`,
    "Outils de Modelisation": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
    </svg>`,
    "Base de données et moteurs de recherche": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>`,
    "Architectures logiciel": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
        <path d="M15 21V9"/>
    </svg>`,
    "Principes de l'ingénierie  logiciel": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/>
        <path d="M12 8h.01"/>
    </svg>`
};

// Ajouter le style CSS pour les expansion panels
const expansionPanelStyle = `
    <style>
        .expansion-panel {
            border: 1px solid var(--light-gray);
            border-radius: 8px;
            margin-bottom: 1rem;
            overflow: hidden;
        }

        .expansion-header {
            display: flex;
            align-items: center;
            padding: 1rem;
            cursor: pointer;
            background-color: var(--light-gray);
            transition: background-color 0.3s ease;
        }

        .expansion-header:hover {
            background-color: var(--medium-gray);
            color: white;
        }

        .expansion-header svg {
            margin-right: 1rem;
            width: 24px;
            height: 24px;
        }

        .expansion-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
            background-color: var(--background-color);
        }

        .expansion-content.active {
            max-height: 500px;
            padding: 1rem;
        }

        .expansion-toggle {
            display: none;
        }

        .expansion-toggle:checked + .expansion-header + .expansion-content {
            max-height: 500px;
            padding: 1rem;
        }

        .skill-item {
            display: flex;
            align-items: center;
            padding: 0.5rem;
            border-bottom: 1px solid var(--light-gray);
        }

        .skill-item:last-child {
            border-bottom: none;
        }
    </style>
`;

// Fonction pour lire le contenu du fichier description.json
function getDescription(category, item) {
    try {
        const descPath = path.join('Competences techniques', category, item, 'description.json');
        if (fs.existsSync(descPath)) {
            const descContent = fs.readFileSync(descPath, 'utf8');
            return JSON.parse(descContent);
        }
    } catch (error) {
        console.error(`Erreur lors de la lecture de description.json pour ${category}/${item}:`, error);
    }
    return null;
}

// Générer le HTML pour les compétences
function generateSkillsHTML(skills) {
    let skillsHTML = '';
    
    Object.entries(skills["Competences techniques"]).forEach(([category, items], index) => {
        const icon = categoryIcons[category] || '';
        
        skillsHTML += `
            <div class="expansion-panel">
                <input type="checkbox" id="panel-${index}" class="expansion-toggle">
                <label class="expansion-header" for="panel-${index}">
                    ${icon}
                    <h3 class="skill-category-title">${category}</h3>
                </label>
                <div class="expansion-content">
                    <div class="skill-list">
        `;
        
        Object.keys(items).forEach(item => {
            const desc = getDescription(category, item);
            const description = desc ? desc.description : `Description pour ${item}`;
            
            skillsHTML += `
                <div class="skill-item">
                    <span>${item}</span>
                    <p class="skill-description">${description}</p>
                </div>
            `;
        });
        
        skillsHTML += `
                    </div>
                </div>
            </div>
        `;
    });
    
    return skillsHTML;
}

// Générer le HTML pour les projets
function generateProjectsHTML(structure) {
    let projectsHTML = '';
    
    if (structure["Projets MVP"]) {
        projectsHTML += `
            <div class="expansion-panel">
                <input type="checkbox" id="panel-mvp" class="expansion-toggle">
                <label class="expansion-header" for="panel-mvp">
                    <h3 class="section-subtitle">Projets MVP</h3>
                </label>
                <div class="expansion-content">
                    <div class="project-list">
                        <!-- Contenu des projets MVP -->
                    </div>
                </div>
            </div>
        `;
    }
    
    if (structure["Projets POCs"]) {
        projectsHTML += `
            <div class="expansion-panel">
                <input type="checkbox" id="panel-poc" class="expansion-toggle">
                <label class="expansion-header" for="panel-poc">
                    <h3 class="section-subtitle">Projets POCs</h3>
                </label>
                <div class="expansion-content">
                    <div class="project-list">
                        <!-- Contenu des projets POC -->
                    </div>
                </div>
            </div>
        `;
    }
    
    return projectsHTML;
}

// Injecter les styles des expansion panels
htmlContent = htmlContent.replace('</style>', `${expansionPanelStyle}</style>`);

// Remplacer les conteneurs dynamiques par le contenu généré
const skillsHTML = generateSkillsHTML(structure);
const projectsHTML = generateProjectsHTML(structure);

// Remplacer les commentaires par le contenu généré
htmlContent = htmlContent.replace(
    '<!-- Le contenu sera généré dynamiquement par JavaScript -->',
    skillsHTML
);

// Remplacer le deuxième commentaire (pour les projets)
htmlContent = htmlContent.replace(
    '<!-- Le contenu sera généré dynamiquement par JavaScript -->',
    projectsHTML
);

// Supprimer la référence au script logic.js puisqu'il n'est plus nécessaire
htmlContent = htmlContent.replace('<script src="logic.js"></script>', '');

// Écrire le fichier HTML final
fs.writeFileSync('index.html', htmlContent);

console.log('HTML généré avec succès!'); 