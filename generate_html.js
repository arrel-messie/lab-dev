const fs = require('fs');
const path = require('path');

// Vérifier si index.html existe et le supprimer
if (fs.existsSync('index.html')) {
    fs.unlinkSync('index.html');
    console.log('Ancien fichier index.html supprimé.');
}

// Charger la structure depuis create_structure.js
const structureContent = fs.readFileSync('create_structure.js', 'utf8');
const structureMatch = structureContent.match(/const structure = ({[\s\S]*?});/);
const structure = JSON.parse(structureMatch[1]);

// Définir le style CSS complet
const styles = `
    /* Variables globales */
    :root {
        --primary-color: #333333;
        --secondary-color: #0071e3;
        --background-color: #ffffff;
        --light-gray: #f5f5f7;
        --medium-gray: #86868b;
        --dark-gray: #1d1d1f;
        --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    /* Reset CSS */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: var(--font-family);
        background-color: var(--background-color);
        color: var(--primary-color);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
    }

    /* En-tête */
    header {
        background-color: var(--background-color);
        padding: 2rem 0;
        text-align: center;
        border-bottom: 1px solid rgba(0,0,0,0.1);
    }

    .profile-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 1.5rem;
    }

    .profile-name {
        font-size: 2.5rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--dark-gray);
    }

    .profile-title {
        font-size: 1.5rem;
        color: var(--medium-gray);
        margin-bottom: 1.5rem;
    }

    /* Contenu principal */
    main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    .section-title {
        font-size: 2rem;
        font-weight: 600;
        margin-bottom: 2rem;
        text-align: center;
        color: var(--dark-gray);
    }

    /* Grille de compétences */
    .tech-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        padding: 20px;
    }

    .tech-category {
        background: var(--background-color);
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .tech-category:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    }

    .category-header {
        background: var(--secondary-color);
        color: white;
        padding: 15px 20px;
        font-size: 1.2em;
        font-weight: 500;
    }

    .category-content {
        padding: 20px;
    }

    .tech-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .tech-item {
        padding: 10px 0;
        border-bottom: 1px solid var(--light-gray);
        display: flex;
        align-items: center;
    }

    .tech-item:last-child {
        border-bottom: none;
    }

    .tech-item::before {
        content: "•";
        color: var(--secondary-color);
        font-weight: bold;
        margin-right: 10px;
    }

    .description-box {
        background: var(--light-gray);
        padding: 15px;
        margin-top: 15px;
        border-radius: 6px;
        font-size: 0.9em;
        color: var(--dark-gray);
    }

    .description-box h4 {
        margin: 0 0 8px 0;
        color: var(--secondary-color);
        font-size: 1em;
    }

    /* Mode sombre */
    @media (prefers-color-scheme: dark) {
        :root {
            --background-color: #000000;
            --light-gray: #1d1d1f;
            --dark-gray: #f5f5f7;
            --primary-color: #f5f5f7;
        }

        .tech-category {
            background: var(--dark-gray);
        }

        .description-box {
            background: rgba(255, 255, 255, 0.05);
        }

        .tech-item {
            border-bottom-color: rgba(255, 255, 255, 0.1);
        }
    }

    /* Responsive */
    @media (max-width: 768px) {
        .tech-grid {
            grid-template-columns: 1fr;
            padding: 10px;
        }

        .profile-name {
            font-size: 2rem;
        }

        .profile-title {
            font-size: 1.2rem;
        }

        .section-title {
            font-size: 1.7rem;
        }
    }
`;

// Fonction pour lire le fichier description.json
function getDescription(folderPath) {
    try {
        const descPath = path.join(folderPath, 'description.json');
        if (fs.existsSync(descPath)) {
            const content = fs.readFileSync(descPath, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.error(`Erreur lors de la lecture de description.json dans ${folderPath}:`, error);
    }
    return null;
}

// Fonction pour générer le HTML pour une catégorie
function generateCategoryHTML(name, content, currentPath = '') {
    const fullPath = path.join(currentPath, name);
    const description = getDescription(fullPath);
    
    let html = `
        <div class="tech-category">
            <div class="category-header">
                ${name}
            </div>
            <div class="category-content">
    `;

    if (description) {
        html += `
            <div class="description-box">
                <h4>À propos</h4>
                <p>${description.description}</p>
            </div>
        `;
    }

    if (typeof content === 'object' && Object.keys(content).length > 0) {
        html += '<ul class="tech-list">';
        Object.entries(content).forEach(([itemName, itemContent]) => {
            const itemPath = path.join(fullPath, itemName);
            const itemDesc = getDescription(itemPath);
            
            html += `
                <li class="tech-item">
                    ${itemName}
                    ${itemDesc ? `
                        <div class="description-box">
                            <p>${itemDesc.description}</p>
                        </div>
                    ` : ''}
                </li>
            `;
        });
        html += '</ul>';
    }

    html += `
            </div>
        </div>
    `;

    return html;
}

// Générer le HTML pour toute la structure
function generateStructureHTML(structure) {
    let html = '<div class="tech-grid">';
    
    // Traiter d'abord les compétences techniques
    if (structure["Competences techniques"]) {
        Object.entries(structure["Competences techniques"]).forEach(([category, content]) => {
            html += generateCategoryHTML(category, content, "Competences techniques");
        });
    }

    // Traiter les projets
    if (structure["Projets MVP"]) {
        html += generateCategoryHTML("Projets MVP", structure["Projets MVP"]);
    }
    if (structure["Projets POCs"]) {
        html += generateCategoryHTML("Projets POCs", structure["Projets POCs"]);
    }

    html += '</div>';
    return html;
}

// Générer le HTML complet
const completeHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Technique</title>
    <style>${styles}</style>
</head>
<body>
    <header>
        <div class="profile-container">
            <h1 class="profile-name">Portfolio Technique</h1>
            <p class="profile-title">Compétences et Projets</p>
        </div>
    </header>
    <main>
        <h2 class="section-title">Mes Compétences</h2>
        ${generateStructureHTML(structure)}
    </main>
</body>
</html>
`;

// Écrire le fichier HTML
fs.writeFileSync('index.html', completeHTML);
console.log('Nouveau fichier index.html généré avec succès!'); 