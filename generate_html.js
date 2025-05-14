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
    :root {
        --sidebar-width: 260px;
        --header-height: 50px;
        --background-color: #ffffff;
        --sidebar-background: #f5f5f7;
        --text-color: #1d1d1f;
        --border-color: #e2e2e2;
        --accent-color: #007AFF;
        --hover-color: #f0f0f0;
        --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: var(--font-family);
        color: var(--text-color);
        line-height: 1.5;
        height: 100vh;
        display: flex;
        overflow: hidden;
    }

    /* Sidebar */
    .sidebar {
        width: var(--sidebar-width);
        height: 100vh;
        background: var(--sidebar-background);
        border-right: 1px solid var(--border-color);
        overflow-y: auto;
        flex-shrink: 0;
    }

    .sidebar-header {
        padding: 15px;
        font-size: 1.1em;
        font-weight: 500;
        border-bottom: 1px solid var(--border-color);
        position: sticky;
        top: 0;
        background: var(--sidebar-background);
        z-index: 1;
    }

    .folder-list {
        list-style: none;
    }

    .folder-item {
        padding: 8px 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95em;
    }

    .folder-item:hover {
        background: var(--hover-color);
    }

    .folder-item.active {
        background: var(--accent-color);
        color: white;
    }

    /* Main Content */
    .main-content {
        flex: 1;
        height: 100vh;
        overflow-y: auto;
        background: var(--background-color);
        display: flex;
        flex-direction: column;
    }

    .content-header {
        height: var(--header-height);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        padding: 0 20px;
        position: sticky;
        top: 0;
        background: var(--background-color);
        z-index: 1;
    }

    .content-title {
        font-size: 1.2em;
        font-weight: 500;
    }

    .content-body {
        padding: 20px;
        flex: 1;
    }

    .description-card {
        background: var(--background-color);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        padding: 15px;
        margin-bottom: 15px;
    }

    .description-title {
        font-size: 1.1em;
        font-weight: 500;
        margin-bottom: 10px;
        color: var(--accent-color);
    }

    .description-text {
        font-size: 0.95em;
        color: var(--text-color);
    }

    /* Items List Styles */
    .items-list {
        margin-top: 15px;
        display: grid;
        gap: 15px;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .items-list .description-card {
        margin: 0;
        background: var(--sidebar-background);
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
        :root {
            --background-color: #1c1c1e;
            --sidebar-background: #2c2c2e;
            --text-color: #ffffff;
            --border-color: #3d3d3d;
            --hover-color: #3a3a3c;
        }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .sidebar {
            width: 100%;
            position: fixed;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
        }

        .sidebar.show {
            transform: translateX(0);
        }

        .main-content {
            width: 100%;
        }

        .menu-toggle {
            display: block;
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

// Fonction pour générer le HTML de la sidebar
function generateSidebarHTML(structure) {
    let html = '<ul class="folder-list">';
    
    // Compétences techniques
    if (structure["Competences techniques"]) {
        Object.entries(structure["Competences techniques"]).forEach(([category]) => {
            html += `
                <li class="folder-item" data-category="${category}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 3a1 1 0 0 1 1-1h3l1 1h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3z" fill="currentColor"/>
                    </svg>
                    ${category}
                </li>
            `;
        });
    }

    // Projets
    if (structure["Projets MVP"]) {
        html += `
            <li class="folder-item" data-category="Projets MVP">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3a1 1 0 0 1 1-1h3l1 1h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3z" fill="currentColor"/>
                </svg>
                Projets MVP
            </li>
        `;
    }
    if (structure["Projets POCs"]) {
        html += `
            <li class="folder-item" data-category="Projets POCs">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3a1 1 0 0 1 1-1h3l1 1h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3z" fill="currentColor"/>
                </svg>
                Projets POCs
            </li>
        `;
    }

    html += '</ul>';
    return html;
}

// Fonction pour générer le contenu principal
function generateMainContentHTML(structure) {
    let html = '';
    
    // Compétences techniques
    if (structure["Competences techniques"]) {
        Object.entries(structure["Competences techniques"]).forEach(([category, items]) => {
            const categoryPath = path.join("Competences techniques", category);
            const description = getDescription(categoryPath);
            
            html += `
                <div class="description-card" data-category="${category}">
                    <h3 class="description-title">${category}</h3>
                    ${description ? `<p class="description-text">${description.description}</p>` : ''}
                    <div class="items-list">
            `;
            
            Object.entries(items).forEach(([itemName]) => {
                const itemPath = path.join(categoryPath, itemName);
                const itemDesc = getDescription(itemPath);
                
                if (itemDesc) {
                    html += `
                        <div class="description-card">
                            <h4 class="description-title">${itemName}</h4>
                            <p class="description-text">${itemDesc.description}</p>
                        </div>
                    `;
                }
            });
            
            html += `
                    </div>
                </div>
            `;
        });
    }

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
    <aside class="sidebar">
        <div class="sidebar-header">Portfolio Technique</div>
        ${generateSidebarHTML(structure)}
    </aside>
    <main class="main-content">
        <header class="content-header">
            <h1 class="content-title">Mes Compétences</h1>
        </header>
        <div class="content-body">
            ${generateMainContentHTML(structure)}
        </div>
    </main>
    <script>
        // Gestion des interactions
        document.querySelectorAll('.folder-item').forEach(item => {
            item.addEventListener('click', () => {
                // Retirer la classe active de tous les éléments
                document.querySelectorAll('.folder-item').forEach(i => i.classList.remove('active'));
                // Ajouter la classe active à l'élément cliqué
                item.classList.add('active');
                
                const category = item.dataset.category;
                // Afficher/masquer les descriptions correspondantes
                document.querySelectorAll('.description-card').forEach(card => {
                    if (card.dataset.category === category) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        // Afficher la première catégorie par défaut
        const firstFolder = document.querySelector('.folder-item');
        if (firstFolder) {
            firstFolder.click();
        }
    </script>
</body>
</html>
`;

// Écrire le fichier HTML
fs.writeFileSync('index.html', completeHTML);
console.log('Nouveau fichier index.html généré avec succès!'); 