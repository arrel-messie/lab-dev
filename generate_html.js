const fs = require('fs');
const path = require('path');

// Charger la structure depuis create_structure.js
const structureContent = fs.readFileSync('create_structure.js', 'utf8');
const structureMatch = structureContent.match(/const structure = ({[\s\S]*?});/);
const structure = JSON.parse(structureMatch[1]);

// Lire le template HTML
let htmlContent = fs.readFileSync('index.html', 'utf8');

// Générer le HTML pour les compétences
function generateSkillsHTML(skills) {
    let skillsHTML = '';
    
    Object.entries(skills["Competences techniques"]).forEach(([category, items]) => {
        skillsHTML += `
                <div class="skill-category">
                    <h3 class="skill-category-title">
                        ${category}
                    </h3>
                    <ul class="skill-list">
        `;
        
        Object.keys(items).forEach(item => {
            skillsHTML += `
                        <li class="skill-item">${item}</li>
            `;
        });
        
        skillsHTML += `
                    </ul>
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
            <div class="project-section">
                <h3 class="section-subtitle">Projets MVP</h3>
                <div class="project-list">
                    <!-- Les projets MVP seront ajoutés ici -->
                </div>
            </div>
        `;
    }
    
    if (structure["Projets POCs"]) {
        projectsHTML += `
            <div class="project-section">
                <h3 class="section-subtitle">Projets POCs</h3>
                <div class="project-list">
                    <!-- Les projets POC seront ajoutés ici -->
                </div>
            </div>
        `;
    }
    
    return projectsHTML;
}

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