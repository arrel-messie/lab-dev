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
    "Portefeuille de compétence": scanDirectory("Competences techniques"),
    "Projets MVP": scanDirectory("Projets MVP"),
    "Projets POCs": scanDirectory("Projets POCs")
};

console.log('Structure générée:', JSON.stringify(structure, null, 2));

// Définir le style CSS complet
const styles = `
    /* Theme Switcher */
    .theme-switch-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
        padding-right: 20px;
    }

    .theme-switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 25px;
        margin: 0 8px;
    }

    .theme-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
        transition: .4s;
        border-radius: 25px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 19px;
        width: 19px;
        left: 2px;
        bottom: 2px;
        background-color: var(--color-header-text);
        transition: .4s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: var(--color-accent-fg);
    }

    input:checked + .slider:before {
        transform: translateX(25px);
    }

    .theme-icon {
        width: 16px;
        height: 16px;
        color: var(--color-header-text);
    }

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

    [data-theme="dark"] {
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
        position: relative;
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
        position: relative;
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

    .content-body {
        position: relative;
        z-index: 1;
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
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
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

    /* Footer Styles */
    .footer {
        background-color: var(--color-header-bg);
        color: var(--color-header-text);
        padding: 40px 0;
        margin-top: 40px;
        position: relative;
        z-index: 1;
    }

    .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-3);
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 40px;
    }

    .footer-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .footer-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--color-header-text);
    }

    .footer-links {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .footer-link {
        color: var(--color-header-text);
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: opacity 0.2s ease;
    }

    .footer-link:hover {
        opacity: 0.8;
    }

    .footer-link svg {
        width: 20px;
        height: 20px;
    }

    .footer-social {
        display: flex;
        gap: 16px;
    }

    .social-link {
        color: var(--color-header-text);
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.1);
        transition: background-color 0.2s ease;
    }

    .social-link:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .social-link svg {
        width: 20px;
        height: 20px;
    }

    .footer-bottom {
        text-align: center;
        padding-top: 40px;
        margin-top: 40px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--color-header-text);
        opacity: 0.8;
    }

    @media (max-width: 768px) {
        .footer-content {
            grid-template-columns: 1fr;
            gap: 32px;
        }
    }
`;

// Lire le contenu de particles.js
const particlesJSContent = fs.readFileSync('particles.js-master/particles.min.js', 'utf8');

// Fonction pour générer le HTML de la sidebar
function generateSidebarHTML(structure) {
    let html = '<ul class="folder-list">';
    
    // Portefeuille de compétence
    if (structure["Portefeuille de compétence"]) {
        console.log('Generating sidebar for Portefeuille de compétence');
        Object.entries(structure["Portefeuille de compétence"]).forEach(([category, subItems]) => {
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
    
    // Portefeuille de compétence
    if (structure["Portefeuille de compétence"]) {
        console.log('Generating main content for Portefeuille de compétence');
        Object.entries(structure["Portefeuille de compétence"]).forEach(([category, items]) => {
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
<html lang="fr" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Technique</title>
    <style>${styles}</style>
</head>
<body>
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
        <div class="theme-switch-wrapper">
            <svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <label class="theme-switch">
                <input type="checkbox" id="theme-toggle">
                <span class="slider"></span>
            </label>
            <svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        </div>
    </header>
    <div class="container">
        <aside class="sidebar">
            ${generateSidebarHTML(structure)}
        </aside>
        <main class="main-content">
            <header class="content-header">
                <h2 class="content-title">Mon Portefeuille de compétence</h2>
            </header>
            <div class="content-body">
                ${generateMainContentHTML(structure)}
            </div>
            <div id="particles-js"></div>
        </main>
    </div>
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3 class="footer-title">Contact</h3>
                <div class="footer-links">
                    <a href="mailto:arrel.messie@gmail.com" class="footer-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        arrel.messie@gmail.com
                    </a>
                    <a href="tel:+33612345678" class="footer-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        +33 6 12 34 56 78
                    </a>
                </div>
            </div>
            <div class="footer-section">
                <h3 class="footer-title">Réseaux sociaux</h3>
                <div class="footer-social">
                    <a href="https://github.com/yourusername" target="_blank" class="social-link">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                    </a>
                    <a href="https://linkedin.com/in/yourusername" target="_blank" class="social-link">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                    </a>
                    <a href="https://twitter.com/yourusername" target="_blank" class="social-link">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                    </a>
                </div>
            </div>
            <div class="footer-section">
                <h3 class="footer-title">Références</h3>
                <div class="footer-links">
                    <a href="https://github.com" target="_blank" class="footer-link">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                    </a>
                    <a href="https://linkedin.com" target="_blank" class="footer-link">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        LinkedIn
                    </a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© ${new Date().getFullYear()} Arrel Messie. Tous droits réservés.</p>
        </div>
    </footer>
    <script>
        ${particlesJSContent}

        // Configuration des particules
        const particlesConfig = {
            particles: {
                number: {
                    value: 100,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#40c463'
                },
                shape: {
                    type: ['circle', 'triangle'],
                    stroke: {
                        width: 0,
                        color: '#000000'
                    },
                    polygon: {
                        nb_sides: 5
                    }
                },
                opacity: {
                    value: 0.6,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 4,
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
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: true,
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
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        };

        // Initialiser particles.js
        document.addEventListener('DOMContentLoaded', function() {
            if (window.particlesJS) {
                console.log('Initializing particles.js');
                try {
                    particlesJS('particles-js', particlesConfig);
                    console.log('particles.js initialized');
                } catch (error) {
                    console.error('Error initializing particles.js:', error);
                }
            } else {
                console.error('particles.js not available');
            }
        });

        // Fonction pour mettre à jour les particules lors du changement de thème
        function updateParticlesTheme() {
            if (window.pJSDom && window.pJSDom[0]) {
                const backgroundColor = getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-canvas-default').trim();
                window.pJSDom[0].pJS.particles.line_linked.color = '#40c463';
                window.pJSDom[0].pJS.particles.color.value = '#40c463';
                window.pJSDom[0].pJS.fn.particlesRefresh();
            }
        }

        // Gestion du thème
        const themeToggle = document.getElementById('theme-toggle');
        const htmlElement = document.documentElement;
        
        // Vérifier s'il y a une préférence sauvegardée
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            htmlElement.setAttribute('data-theme', savedTheme);
            themeToggle.checked = savedTheme === 'dark';
        } else {
            // Vérifier la préférence système
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                htmlElement.setAttribute('data-theme', 'dark');
                themeToggle.checked = true;
            }
        }

        // Gérer le changement de thème
        themeToggle.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark' : 'light';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateParticlesTheme();
        });

        // Mettre à jour les particules lors du redimensionnement de la fenêtre
        window.addEventListener('resize', function() {
            if (window.pJSDom && window.pJSDom[0]) {
                window.pJSDom[0].pJS.fn.vendors.destroypJS();
                particlesJS('particles-js', particlesConfig);
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