const fs = require('fs');
const path = require('path');
const marked = require('marked');

// Configuration de marked pour une sortie sécurisée
marked.setOptions({
    headerIds: false,
    mangle: false,
    sanitize: true
});

// Vérifier si index.html existe et le supprimer
if (fs.existsSync('index.html')) {
    fs.unlinkSync('index.html');
    console.log('Ancien fichier index.html supprimé.');
}

// Fonction pour lire récursivement la structure des dossiers
function scanDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            console.log(`Le dossier ${dirPath} n'existe pas`);
            return {};
        }

        const items = {};
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        console.log(`Scanning directory: ${dirPath}`);
        
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const fullPath = path.join(dirPath, entry.name);
                console.log(`Found directory: ${entry.name} in ${dirPath}`);
                items[entry.name] = scanDirectory(fullPath);
            }
        }

        return items;
    } catch (error) {
        console.error(`Erreur lors du scan du dossier ${dirPath}:`, error);
        return {};
    }
}

// Fonction pour lire le contenu Markdown des notes
function getNotes(folderPath) {
    try {
        const notesPath = path.join(folderPath, 'notes.md');
        if (fs.existsSync(notesPath)) {
            console.log(`Reading notes from: ${notesPath}`);
            const content = fs.readFileSync(notesPath, 'utf8');
            return marked.parse(content);
        }
    } catch (error) {
        console.error(`Erreur lors de la lecture des notes dans ${folderPath}:`, error);
    }
    return null;
}

// Fonction pour lire le fichier description.json
function getDescription(folderPath) {
    try {
        const descPath = path.join(folderPath, 'description.json');
        console.log(`Trying to read description from: ${descPath}`);
        if (fs.existsSync(descPath)) {
            const content = fs.readFileSync(descPath, 'utf8');
            const description = JSON.parse(content);
            // Vérifier si des notes existent
            const notes = getNotes(folderPath);
            if (notes) {
                description.notes = notes;
            }
            console.log(`Description found for ${folderPath}:`, description);
            return description;
        } else {
            console.log(`No description.json found in ${folderPath}`);
        }
    } catch (error) {
        console.error(`Erreur lors de la lecture de description.json dans ${folderPath}:`, error);
    }
    return null;
}

// Générer la structure dynamiquement
console.log('Début de la génération de la structure...');
const structure = {
    "Competences techniques": scanDirectory("Competences techniques"),
    "Projets MVP": scanDirectory("Projets MVP"),
    "Projets POCs": scanDirectory("Projets POCs")
};

console.log('Structure générée:', JSON.stringify(structure, null, 2));

// Définir le style CSS complet
const styles = `
    :root {
        --color-canvas-default: #ffffff;
        --color-canvas-subtle: #f6f8fa;
        --color-header-bg: #24292f;
        --color-header-text: #ffffff;
        --color-border-default: #d0d7de;
        --color-border-muted: #d8dee4;
        --color-accent-fg: #0969da;
        --color-accent-subtle: #ddf4ff;
        --color-fg-default: #24292f;
        --color-fg-muted: #57606a;
        --color-neutral-muted: rgba(175,184,193,0.2);
        --color-btn-hover-bg: #f3f4f6;
        --spacing-3: 16px;
        --spacing-2: 8px;
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: var(--color-fg-default);
        background-color: var(--color-canvas-default);
    }

    /* Header */
    .header {
        background-color: var(--color-header-bg);
        color: var(--color-header-text);
        padding: 16px;
        display: flex;
        align-items: center;
        height: 62px;
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        flex: 1;
    }

    .header-title-section {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .header-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        color: var(--color-header-text);
    }

    .header-subtitle {
        font-size: 14px;
        color: #7d8590;
        font-weight: 400;
        margin: 0;
    }

    /* Layout */
    .container {
        display: flex;
        height: calc(100vh - 62px);
        position: relative;
        z-index: 1;
    }

    /* Sidebar */
    .sidebar {
        width: 296px;
        background: var(--color-canvas-default);
        border-right: 1px solid var(--color-border-default);
        overflow-y: auto;
        padding: var(--spacing-3);
    }

    .folder-list {
        list-style: none;
    }

    .folder-item {
        padding: var(--spacing-2) var(--spacing-2);
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        color: var(--color-fg-default);
        font-size: 14px;
        text-decoration: none;
    }

    .folder-item:hover {
        background: var(--color-btn-hover-bg);
    }

    .folder-item.active {
        background: var(--color-accent-subtle);
        color: var(--color-accent-fg);
        font-weight: 600;
    }

    .folder-item svg {
        color: var(--color-fg-muted);
    }

    /* Main Content */
    .main-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-3);
        background: var(--color-canvas-default);
    }

    .content-header {
        padding-bottom: var(--spacing-3);
        margin-bottom: var(--spacing-3);
        border-bottom: 1px solid var(--color-border-muted);
    }

    .content-title {
        font-size: 24px;
        font-weight: 400;
        color: var(--color-fg-default);
    }

    /* Cards */
    .description-card {
        background: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        padding: var(--spacing-3);
        margin-bottom: var(--spacing-3);
    }

    .description-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: var(--spacing-2);
        color: var(--color-fg-default);
    }

    .description-text {
        color: var(--color-fg-muted);
        font-size: 14px;
        margin-bottom: var(--spacing-2);
    }

    /* Items List */
    .items-list {
        display: grid;
        gap: var(--spacing-3);
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        margin-top: var(--spacing-3);
    }

    .items-list .description-card {
        margin: 0;
        background: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        transition: border-color 0.2s ease;
    }

    .items-list .description-card:hover {
        border-color: var(--color-accent-fg);
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
        :root {
            --color-canvas-default: #0d1117;
            --color-canvas-subtle: #161b22;
            --color-header-bg: #161b22;
            --color-border-default: #30363d;
            --color-border-muted: #21262d;
            --color-accent-fg: #58a6ff;
            --color-accent-subtle: rgba(56,139,253,0.1);
            --color-fg-default: #c9d1d9;
            --color-fg-muted: #8b949e;
            --color-btn-hover-bg: #21262d;
        }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .sidebar {
            position: fixed;
            left: 0;
            top: 62px;
            bottom: 0;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 1000;
        }

        .sidebar.show {
            transform: translateX(0);
        }

        .header {
            padding-left: var(--spacing-2);
        }

        .menu-toggle {
            display: block;
        }
    }

    /* Notes Section */
    .notes-section {
        margin-top: var(--spacing-3);
        padding: var(--spacing-3);
        background: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        display: none;
    }

    .notes-section h3 {
        margin-bottom: var(--spacing-2);
        color: var(--color-fg-default);
    }

    .notes-content {
        color: var(--color-fg-muted);
        font-size: 14px;
        line-height: 1.5;
    }

    .description-card.has-notes {
        cursor: pointer;
    }

    .description-card.has-notes:hover {
        border-color: var(--color-accent-fg);
    }

    /* Particles.js Styles */
    #particles-js {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        background-color: var(--color-canvas-default);
    }

    #particles-js canvas {
        display: block;
        vertical-align: bottom;
        -webkit-transform: scale(1);
        -ms-transform: scale(1);
        transform: scale(1);
        opacity: 1;
        -webkit-transition: opacity .8s ease, -webkit-transform 1.4s ease;
        transition: opacity .8s ease, transform 1.4s ease;
    }
`;

// Copier particles.js dans le répertoire assets
try {
    fs.copyFileSync('particles.min.js', 'assets/js/particles.min.js');
    console.log('particles.min.js copied to assets/js directory');
} catch (error) {
    console.error('Error copying particles.min.js:', error);
}

// Fonction pour générer le HTML de la sidebar
function generateSidebarHTML(structure) {
    let html = '<ul class="folder-list">';
    
    // Compétences techniques
    if (structure["Competences techniques"]) {
        console.log('Generating sidebar for Competences techniques');
        Object.entries(structure["Competences techniques"]).forEach(([category, subItems]) => {
            console.log(`Adding category to sidebar: ${category}`);
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
    ['Projets MVP', 'Projets POCs'].forEach(projectType => {
        if (structure[projectType] && Object.keys(structure[projectType]).length > 0) {
            console.log(`Generating sidebar for ${projectType}`);
            html += `
                <li class="folder-item" data-category="${projectType}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 3a1 1 0 0 1 1-1h3l1 1h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3z" fill="currentColor"/>
                    </svg>
                    ${projectType}
                </li>
            `;
        }
    });

    html += '</ul>';
    return html;
}

// Fonction pour générer le contenu principal
function generateMainContentHTML(structure) {
    let html = '';
    
    // Compétences techniques
    if (structure["Competences techniques"]) {
        console.log('Generating main content for Competences techniques');
        Object.entries(structure["Competences techniques"]).forEach(([category, items]) => {
            const categoryPath = path.join("Competences techniques", category);
            const description = getDescription(categoryPath);
            
            if (description) {  // Ne générer que si description.json existe
                console.log(`Generating content for category: ${category}`);
                html += `
                    <div class="description-card" data-category="${category}">
                        <h3 class="description-title">${category}</h3>
                        <p class="description-text">${description.description}</p>
                        <div class="items-list">
                `;
                
                Object.entries(items).forEach(([itemName, subItems]) => {
                    const itemPath = path.join(categoryPath, itemName);
                    const itemDesc = getDescription(itemPath);
                    
                    if (itemDesc) {  // Ne générer que si description.json existe
                        const hasNotes = itemDesc.notes ? 'has-notes' : '';
                        const notesData = itemDesc.notes ? `data-notes="${encodeURIComponent(itemDesc.notes)}"` : '';
                        
                        console.log(`Adding item: ${itemName} to category: ${category}`);
                        html += `
                            <div class="description-card ${hasNotes}" ${notesData}>
                                <h4 class="description-title">${itemName}</h4>
                                <p class="description-text">${itemDesc.description}</p>
                            </div>
                        `;
                    }
                });
                
                html += `
                        </div>
                        <div class="notes-section">
                            <h3>Notes</h3>
                            <div class="notes-content"></div>
                        </div>
                    </div>
                `;
            }
        });
    }

    // Ajouter le contenu pour les projets avec la même logique
    ['Projets MVP', 'Projets POCs'].forEach(projectType => {
        if (structure[projectType]) {
            console.log(`Generating content for ${projectType}`);
            const description = getDescription(projectType);
            
            if (description) {  // Ne générer que si description.json existe
                html += `
                    <div class="description-card" data-category="${projectType}">
                        <h3 class="description-title">${projectType}</h3>
                        <p class="description-text">${description.description}</p>
                        <div class="items-list">
                `;
                
                Object.entries(structure[projectType]).forEach(([projectName, projectDetails]) => {
                    const projectPath = path.join(projectType, projectName);
                    const projectDesc = getDescription(projectPath);
                    
                    if (projectDesc) {  // Ne générer que si description.json existe
                        const hasNotes = projectDesc.notes ? 'has-notes' : '';
                        const notesData = projectDesc.notes ? `data-notes="${encodeURIComponent(projectDesc.notes)}"` : '';
                        
                        console.log(`Adding project: ${projectName} to ${projectType}`);
                        html += `
                            <div class="description-card ${hasNotes}" ${notesData}>
                                <h4 class="description-title">${projectName}</h4>
                                <p class="description-text">${projectDesc.description}</p>
                            </div>
                        `;
                    }
                });
                
                html += `
                        </div>
                        <div class="notes-section">
                            <h3>Notes</h3>
                            <div class="notes-content"></div>
                        </div>
                    </div>
                `;
            }
        }
    });

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
    <div id="particles-js"></div>
    <header class="header">
        <div class="header-content">
            <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" fill="currentColor">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <div class="header-title-section">
                <h1 class="header-title">Portfolio Technique</h1>
                <p class="header-subtitle">Arrel Messie, Développeur Logiciel</p>
            </div>
        </div>
    </header>
    <div class="container">
        <aside class="sidebar">
            ${generateSidebarHTML(structure)}
        </aside>
        <main class="main-content">
            <header class="content-header">
                <h2 class="content-title">Mes Compétences</h2>
            </header>
            <div class="content-body">
                ${generateMainContentHTML(structure)}
            </div>
        </main>
    </div>
    <script>
        // Fonction pour charger un script de manière asynchrone
        function loadScript(src, callback) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = src;
            script.onload = callback;
            document.head.appendChild(script);
        }

        // Charger particles.js puis l'initialiser
        loadScript('assets/js/particles.js', function() {
            console.log('particles.js loaded');
            if (window.particlesJS) {
                console.log('Initializing particles.js');
                try {
                    particlesJS('particles-js', {
                        particles: {
                            number: {
                                value: 60,
                                density: {
                                    enable: true,
                                    value_area: 1000
                                }
                            },
                            color: {
                                value: '#40c463'
                            },
                            shape: {
                                type: 'circle'
                            },
                            opacity: {
                                value: 0.3,
                                random: false,
                                anim: {
                                    enable: true,
                                    speed: 1,
                                    opacity_min: 0.1,
                                    sync: false
                                }
                            },
                            size: {
                                value: 3,
                                random: true,
                                anim: {
                                    enable: true,
                                    speed: 2,
                                    size_min: 0.1,
                                    sync: false
                                }
                            },
                            line_linked: {
                                enable: true,
                                distance: 150,
                                color: '#40c463',
                                opacity: 0.2,
                                width: 1
                            },
                            move: {
                                enable: true,
                                speed: 1.5,
                                direction: 'none',
                                random: false,
                                straight: false,
                                out_mode: 'out',
                                bounce: false,
                                attract: {
                                    enable: true,
                                    rotateX: 600,
                                    rotateY: 1200
                                }
                            }
                        },
                        interactivity: {
                            detect_on: 'canvas',
                            events: {
                                onhover: {
                                    enable: true,
                                    mode: 'grab'
                                },
                                onclick: {
                                    enable: true,
                                    mode: 'push'
                                },
                                resize: true
                            },
                            modes: {
                                grab: {
                                    distance: 140,
                                    line_linked: {
                                        opacity: 0.5
                                    }
                                },
                                push: {
                                    particles_nb: 3
                                }
                            }
                        },
                        retina_detect: true
                    });
                    console.log('particles.js initialized');
                } catch (error) {
                    console.error('Error initializing particles.js:', error);
                }
            } else {
                console.error('particles.js not available');
            }
        });

        // Gestion des interactions
        document.querySelectorAll('.folder-item').forEach(item => {
            item.addEventListener('click', () => {
                // Retirer la classe active de tous les éléments
                document.querySelectorAll('.folder-item').forEach(i => i.classList.remove('active'));
                // Ajouter la classe active à l'élément cliqué
                item.classList.add('active');
                
                const category = item.dataset.category;
                
                // Afficher/masquer les descriptions correspondantes
                document.querySelectorAll('.content-body > .description-card').forEach(card => {
                    if (card.dataset.category === category) {
                        card.style.display = 'block';
                        // S'assurer que les items-list à l'intérieur sont visibles
                        const itemsList = card.querySelector('.items-list');
                        if (itemsList) {
                            itemsList.style.display = 'grid';
                        }
                        // Cacher la section notes
                        const notesSection = card.querySelector('.notes-section');
                        if (notesSection) {
                            notesSection.style.display = 'none';
                        }
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        // Gestion des clics sur les items avec notes
        document.querySelectorAll('.description-card.has-notes').forEach(item => {
            item.addEventListener('click', () => {
                const notes = decodeURIComponent(item.dataset.notes);
                const card = item.closest('.description-card[data-category]');
                const notesSection = card.querySelector('.notes-section');
                const notesContent = card.querySelector('.notes-content');
                
                if (notesSection && notesContent) {
                    notesContent.innerHTML = notes;
                    notesSection.style.display = 'block';
                }
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