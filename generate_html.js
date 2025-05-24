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
const allNotes = {};

function getNotes(folderPath, noteFile = 'index.md') {
    try {
        const notesPath = path.join(folderPath, noteFile);
        if (fs.existsSync(notesPath)) {
            const content = fs.readFileSync(notesPath, 'utf8');
            // Remplacement des liens spéciaux [texte](note:chemin)
            const htmlDiagram = `
<div class="custom-diagram">
  <div class="diagram-row">
    <div class="diagram-box">VCS<br><span class="diagram-sub">Git, SVN, etc.</span></div>
    <div class="diagram-arrow"></div>
    <div class="diagram-box">Build</div>
  </div>
  <div class="diagram-row">
    <div class="diagram-spacer"></div>
    <div class="diagram-arrow vertical"></div>
    <div class="diagram-box">Jenkins /<br>GitLab CI</div>
    <div class="diagram-arrow horizontal"></div>
    <div class="diagram-box">Reporting</div>
  </div>
  <div class="diagram-row">
    <div class="diagram-box orange">Squash</div>
    <div class="diagram-arrow down"></div>
    <div class="diagram-box green">Selenium</div>
    <div class="diagram-arrow down"></div>
    <div class="diagram-box blue">OctoPerf</div>
  </div>
  <div class="diagram-row">
    <div class="diagram-spacer"></div>
    <div class="diagram-arrow vertical"></div>
    <div class="diagram-box">Run Tests</div>
  </div>
</div>
<style>
.custom-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px auto;
  font-family: sans-serif;
  gap: 0;
}
.diagram-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
}
.diagram-box {
  min-width: 120px;
  min-height: 48px;
  background: #fff;
  border: 2px solid #222;
  border-radius: 12px;
  margin: 12px 8px;
  padding: 10px 18px;
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
  position: relative;
  box-shadow: 0 2px 8px #0001;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.diagram-box.orange { background: #ffd580; }
.diagram-box.green { background: #b6e7a7; }
.diagram-box.blue { background: #8fd3f4; }
.diagram-sub {
  font-size: 0.85em;
  color: #555;
  font-weight: 400;
}
.diagram-arrow {
  width: 32px;
  height: 2px;
  background: #222;
  position: relative;
  margin: 0 4px;
}
.diagram-arrow::after {
  content: '';
  position: absolute;
  right: -6px;
  top: -5px;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 10px solid #222;
}
.diagram-arrow.vertical {
  width: 2px;
  height: 32px;
  background: #222;
  margin: 0 0 0 0;
}
.diagram-arrow.vertical::after {
  content: '';
  position: absolute;
  left: -5px;
  bottom: -6px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 10px solid #222;
  border-bottom: none;
  top: auto;
  right: auto;
}
.diagram-arrow.horizontal {
  width: 32px;
  height: 2px;
  background: #222;
  margin: 0 4px;
}
.diagram-arrow.horizontal::after {
  content: '';
  position: absolute;
  right: -6px;
  top: -5px;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 10px solid #222;
}
.diagram-arrow.down {
  width: 2px;
  height: 32px;
  background: #222;
  margin: 0 0 0 0;
}
.diagram-arrow.down::after {
  content: '';
  position: absolute;
  left: -5px;
  bottom: -6px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 10px solid #222;
  border-bottom: none;
  top: auto;
  right: auto;
}
.diagram-spacer {
  width: 120px;
  height: 1px;
}
@media (max-width: 700px) {
  .custom-diagram { font-size: 0.9em; }
  .diagram-box { min-width: 80px; padding: 8px 6px; }
  .diagram-spacer { width: 40px; }
}
                `;
            let parsed = content.replace(/\[([^\]]+)\]\(note:([^\)]+)\)/g, (match, text, notePath) => {
                return `<a href="#" class="note-link" data-note="${notePath}">${text}</a>`;
            });
            // Remplacement du diagramme Mermaid si besoin
            if (parsed.includes('```mermaid')) {
                parsed = parsed.replace(/```mermaid[\s\S]*?```/, htmlDiagram);
            }
            const html = marked.parse(parsed);
            // Stocker la note dans allNotes
            allNotes[notesPath.replace(/\\/g, '/')] = html;
            return html;
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
        height: 100vh;
        position: relative;
        z-index: 1;
        width: 100%;
    }

    /* Sidebar */
    .sidebar {
        width: 296px;
        min-width: 296px;
        background: var(--color-canvas-default);
        border-right: 1px solid var(--color-border-default);
        overflow-y: auto;
        transition: all 0.3s ease;
        transform: translateX(0);
        display: flex;
        flex-direction: column;
    }

    .sidebar.hidden {
        transform: translateX(-100%);
        width: 0;
        min-width: 0;
        border-right: none;
    }

    .content-header {
        background-color: var(--color-header-bg);
        color: var(--color-header-text);
        padding: 16px;
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        border-bottom: 1px solid var(--color-border-default);
        margin-bottom: var(--spacing-3);
        transition: all 0.3s ease;
        height: 62px;
        box-sizing: border-box;
    }

    .header-title-section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
    }

    .header-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
        color: var(--color-header-text);
    }

    .header-subtitle {
        font-size: 1rem;
        color: var(--color-header-text);
        opacity: 0.8;
        margin: 0;
    }

    .sidebar-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-3);
        padding-top: calc(var(--spacing-3) + 62px);
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
        transition: all 0.3s ease;
        width: calc(100% - 296px);
    }

    .main-content.expanded {
        width: 100%;
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
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
            top: 0;
            bottom: 0;
            z-index: 1000;
            background: var(--color-canvas-default);
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        }

        .sidebar.hidden {
            transform: translateX(-100%);
            box-shadow: none;
        }

        .main-content {
            width: 100%;
            margin-left: 0;
            padding-top: 60px; /* Espace pour le bouton toggle */
        }

        .main-content.expanded {
            width: 100%;
        }

        .content-header {
            margin-top: 0;
        }

        .sidebar-content {
            padding-top: calc(var(--spacing-3) + 60px);
        }
    }

    @media (min-width: 769px) {
        .sidebar-toggle {
            display: none;
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

    /* Item Icons */
    .item-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
    }

    .item-icon {
        width: 24px;
        height: 24px;
        color: var(--color-accent-fg);
        flex-shrink: 0;
    }

    .item-icon svg {
        width: 100%;
        height: 100%;
    }

    .description-card {
        display: flex;
        flex-direction: column;
    }

    .description-card .description-title {
        margin: 0;
    }

    /* Sidebar Toggle Button */
    .sidebar-toggle {
        position: fixed;
        left: 16px;
        top: 16px;
        z-index: 1001;
        background: var(--color-header-bg);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.3s ease;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .sidebar-toggle:hover {
        transform: scale(1.1);
    }

    .sidebar-toggle svg {
        width: 24px;
        height: 24px;
        color: var(--color-header-text);
        transition: transform 0.3s ease;
    }

    .sidebar-toggle.active svg {
        transform: rotate(180deg);
    }

    /* Items List Responsive */
    @media (max-width: 480px) {
        .items-list {
            grid-template-columns: 1fr;
        }

        .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-2);
        }

        .header-title-section {
            width: 100%;
        }

        .theme-switch-wrapper {
            margin-left: 0;
            margin-top: var(--spacing-2);
        }
    }

    /* Diagram Styles */
    .workflow-diagram {
        width: 100%;
        max-width: 1200px;
        margin: 20px auto;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .phase {
        margin-bottom: 30px;
        border: 1px solid var(--color-border-default);
        border-radius: 8px;
        padding: 15px;
        background: var(--color-canvas-subtle);
    }

    .phase-title {
        font-weight: 600;
        margin-bottom: 15px;
        color: var(--color-fg-default);
        font-size: 16px;
    }

    .phase-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .node {
        padding: 10px 15px;
        border-radius: 6px;
        background: var(--color-canvas-default);
        border: 2px solid #333;
        position: relative;
        min-width: 120px;
        text-align: center;
        margin: 10px 0;
    }

    .node.user { background: #f9f; }
    .node.pipeline { background: #bbf; }
    .node.test { background: #bfb; }
    .node.report { background: #fbb; }
    .node.decision { background: #bbf; }
    .node.success { background: #bfb; }
    .node.failure { background: #fbb; }

    .subphase {
        display: flex;
        flex-direction: column;
        gap: 15px;
        padding: 15px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background: var(--color-canvas-default);
        margin: 10px 0;
    }

    .subphase-title {
        font-weight: 600;
        color: var(--color-fg-default);
        font-size: 14px;
    }

    .subphase-content {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .connection {
        position: relative;
        padding: 0 20px;
        color: var(--color-fg-muted);
        font-size: 12px;
        margin: 5px 0;
    }

    .connection::before {
        content: '→';
        position: absolute;
        left: 0;
    }

    .connection-label {
        position: absolute;
        top: -15px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-canvas-default);
        padding: 0 5px;
        font-size: 12px;
        color: var(--color-fg-muted);
    }

    .node-group {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .node-row {
        display: flex;
        gap: 20px;
        justify-content: center;
        margin: 10px 0;
    }

    .return-arrow {
        position: relative;
        margin-top: 20px;
    }

    .return-arrow::before {
        content: '↺';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        font-size: 20px;
        color: var(--color-fg-muted);
    }

    @media (max-width: 768px) {
        .node-row {
            flex-direction: column;
            align-items: center;
        }

        .node {
            width: 100%;
            max-width: 300px;
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

// Fonction pour obtenir l'icône appropriée en fonction du nom de l'item
function getItemIcon(itemName) {
    const icons = {
        // Langages de programmation
        'JavaScript': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
        </svg>`,
        'Python': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
        </svg>`,
        'Java': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.851 18.56s-.917.534.653.714c1.902.151 2.874.121 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.107-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.151 3.636.151 5.74 0 0 0 .384.389.987.602-3.94 1.465-9.08.602-7.269-1.526M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-3.637 1.115-9.289 1.445-10.937.98-.712-.16.75-.59.75-.59s-1.3-.36-.532-.69c1.67-.79 8.255-1.169 10.559-.98 0 0 .3.28.001.279M8.691 14.71s-1.286.825.452 1.076c2.567.301 5.21.301 7.8 0 0 0 .301.375.904.601-4.24 1.26-9.904.601-9.156-1.677M17.116 17.584c4.503 2.34 1.77 4.674.968 4.811-3.189.53-8.221.03-9.673-.53-.21-.09.375-.66.375-.66s-.6-.45-.3-.72c2.205-1.26 6.704-.75 8.63-.901M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-4.547 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.6-3.572 1.13-3.688.601-8.162.6-10.937.15 0-.001.553.91 3.393.918M17.64 14.72c.722.902-.18 1.803-.18 1.803s2.204-1.13 1.203-2.704c-.902-1.354-1.803-2.255 2.255-4.207 0 0-6.162 1.504-3.278 5.108M5.772 17.869c-2.017 1.504 1.504 2.704 1.504 2.704-4.57 1.354-10.533.451-11.39-.902-.15-.301.45-.6.45-.6s-.3-.39-.15-.6c1.504-1.203 6.02-.902 9.586-.602M6.824 12.431c-1.504 1.354.15 2.404.15 2.404-3.308 1.203-7.22.602-7.82 0-.15-.15.3-.6.3-.6s-.3-.3-.15-.45c1.203-1.053 4.97-.902 7.52-.354M9.734 2.705c-2.704 1.504 1.203 3.007 1.203 3.007-4.82 1.504-8.132.902-8.732.15-.15-.15.3-.6.3-.6s-.3-.3-.15-.45c1.203-1.203 5.24-1.504 7.379-2.107M17.49 11.23c3.007 1.504-1.203 3.308-1.203 3.308s3.308-1.203 1.804-2.855c-1.203-1.354-2.255-2.255 3.007-4.207 0 0-7.22 1.504-3.608 3.754M5.923 7.325c-1.354 1.203.15 2.255.15 2.255-2.855 1.053-5.24.752-5.54.15-.15-.15.3-.6.3-.6s-.3-.3-.15-.45c1.203-1.053 3.308-.902 5.24-.355M8.276 20.08c4.322.277 10.959-.153 11.116-2.198 0 0-.302.6-3.572 1.13-3.688.601-8.162.6-10.937.15 0-.001.553.91 3.393.918M17.64 14.72c.722.902-.18 1.803-.18 1.803s2.204-1.13 1.203-2.704c-.902-1.354-1.803-2.255 2.255-4.207 0 0-6.162 1.504-3.278 5.108M5.772 17.869c-2.017 1.504 1.504 2.704 1.504 2.704-4.57 1.354-10.533.451-11.39-.902-.15-.301.45-.6.45-.6s-.3-.39-.15-.6c1.504-1.203 6.02-.902 9.586-.602M6.824 12.431c-1.504 1.354.15 2.404.15 2.404-3.308 1.203-7.22.602-7.82 0-.15-.15.3-.6.3-.6s-.3-.3-.15-.45c1.203-1.053 4.97-.902 7.52-.354M9.734 2.705c-2.704 1.504 1.203 3.007 1.203 3.007-4.82 1.504-8.132.902-8.732.15-.15-.15.3-.6.3-.6s-.3-.3-.15-.45c1.203-1.203 5.24-1.504 7.379-2.107M17.49 11.23c3.007 1.504-1.203 3.308-1.203 3.308s3.308-1.203 1.804-2.855c-1.203-1.354-2.255-2.255 3.007-4.207 0 0-7.22 1.504-3.608 3.754M5.923 7.325c-1.354 1.203.15 2.255.15 2.255-2.855 1.053-5.24.752-5.54.15-.15-.15.3-.6.3-.6s-.3-.3-.15-.45c1.203-1.053 3.308-.902 5.24-.355M8.276 20.08c4.322.277 10.959-.153 11.116-2.198 0 0-.302.6-3.572 1.13-3.688.601-8.162.6-10.937.15 0-.001.553.91 3.393.918"/>
        </svg>`,
        'C++': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.394 6c-.167-.29-.398-.543-.652-.69L12.926.22c-.509-.294-1.34-.294-1.848 0L2.26 5.31c-.508.293-.923 1.013-.923 1.6v10.18c0 .294.104.62.271.91.167.29.398.543.652.69l8.816 5.09c.508.293 1.34.293 1.848 0l8.816-5.09c.254-.147.485-.4.652-.69.167-.29.27-.616.27-.91V6.91c.003-.294-.1-.62-.268-.91zM12 19.11c-3.92 0-7.109-3.19-7.109-7.11 0-3.92 3.19-7.11 7.11-7.11a7.133 7.133 0 016.156 3.553l-3.076 1.78a3.567 3.567 0 00-3.08-1.78A3.56 3.56 0 008.444 12 3.56 3.56 0 0012 15.555a3.57 3.57 0 003.08-1.778l3.078 1.777A7.135 7.135 0 0112 19.11zm7.11-6.715h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79zm2.962 0h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79z"/>
        </svg>`,
        // Frameworks
        'React': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 18.5c-3.59 0-6.5-2.91-6.5-6.5S8.41 5.5 12 5.5s6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5zm0-11c-2.48 0-4.5 2.02-4.5 4.5S9.52 16.5 12 16.5s4.5-2.02 4.5-4.5S14.48 7.5 12 7.5z"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>`,
        'Vue.js': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 19h20L12 2zm0 4.5L18.5 17H5.5L12 6.5z"/>
        </svg>`,
        'Angular': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 19h20L12 2zm0 4.5L18.5 17H5.5L12 6.5z"/>
        </svg>`,
        // Base de données
        'MySQL': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>`,
        'MongoDB': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>`,
        // Outils de développement
        'Git': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>`,
        'Docker': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>`,
        // Par défaut
        'default': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>`
    };

    // Chercher une correspondance exacte
    if (icons[itemName]) {
        return icons[itemName];
    }

    // Chercher une correspondance partielle
    for (const [key, value] of Object.entries(icons)) {
        if (itemName.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }

    // Retourner l'icône par défaut si aucune correspondance n'est trouvée
    return icons.default;
}

// Modifier la fonction generateMainContentHTML pour inclure le rendu Mermaid
function generateMainContentHTML(structure) {
    let html = '';
    
    // Portefeuille de compétence
    if (structure["Portefeuille de compétence"]) {
        console.log('Generating main content for Portefeuille de compétence');
        Object.entries(structure["Portefeuille de compétence"]).forEach(([category, items]) => {
            const categoryPath = path.join("Competences techniques", category);
            const description = getDescription(categoryPath);
            
            if (description) {
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
                    
                    if (itemDesc) {
                        const hasNotes = itemDesc.notes ? 'has-notes' : '';
                        const notesData = itemDesc.notes ? `data-notes="${encodeURIComponent(itemDesc.notes)}"` : '';
                        const itemIcon = getItemIcon(itemName);
                        
                        console.log(`Adding item: ${itemName} to category: ${category}`);
                        html += `
                            <div class="description-card ${hasNotes}" ${notesData}>
                                <div class="item-header">
                                    <div class="item-icon">${itemIcon}</div>
                                    <h4 class="description-title">${itemName}</h4>
                                </div>
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
                        const projectIcon = getItemIcon(projectName);
                        
                        console.log(`Adding project: ${projectName} to ${projectType}`);
                        html += `
                            <div class="description-card ${hasNotes}" ${notesData}>
                                <div class="item-header">
                                    <div class="item-icon">${projectIcon}</div>
                                    <h4 class="description-title">${projectName}</h4>
                                </div>
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

// Ajout du CSS pour la navigation des notes
const notesNavCSS = `
.notes-nav {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}
.notes-back, .notes-forward {
  background: none;
  border: none;
  color: var(--color-fg-muted);
  font-size: 1.5em;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}
.notes-back:hover, .notes-forward:hover {
  background: var(--color-btn-hover-bg);
}
.notes-back[disabled], .notes-forward[disabled] {
  opacity: 0.3;
  cursor: default;
}
`;

const stylesWithNotesNav = styles + notesNavCSS;

// Générer le HTML complet
const allNotesJSON = JSON.stringify(allNotes);

const completeHTML = `
<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Technique</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>${stylesWithNotesNav}</style>
</head>
<body>
    <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle Sidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
    </button>
    <div class="container">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-content">
                ${generateSidebarHTML(structure)}
            </div>
        </aside>
        <main class="main-content" id="main-content">
            <header class="content-header">
                <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" fill="currentColor">
                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                </svg>
                <div class="header-title-section">
                    <h1 class="header-title">Portfolio Technique</h1>
                    <p class="header-subtitle">Arrel Messie, Développeur Logiciel</p>
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
    window.allNotes = ${allNotesJSON};
    // Navigation dynamique entre notes avec historique
    (function() {
      const notesSectionSelector = '.notes-section';
      let notesHistory = [];
      let notesFuture = [];
      let currentNote = null;

      function renderNote(notePath, pushHistory = true) {
        const notesSection = document.querySelector(notesSectionSelector);
        if (!notesSection) return;
        const notesContent = notesSection.querySelector('.notes-content');
        if (!notesContent) return;
        const html = window.allNotes[notePath] || '<em>Note introuvable.</em>';
        notesContent.innerHTML = html;
        if (pushHistory && currentNote) {
          notesHistory.push(currentNote);
          notesFuture = [];
        }
        currentNote = notePath;
        renderNotesNav();
        // Réactiver les liens dynamiques
        notesContent.querySelectorAll('.note-link').forEach(link => {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-note');
            if (target) renderNote(target);
          });
        });
      }
      function renderNotesNav() {
        const notesSection = document.querySelector(notesSectionSelector);
        if (!notesSection) return;
        let nav = notesSection.querySelector('.notes-nav');
        if (!nav) {
          nav = document.createElement('div');
          nav.className = 'notes-nav';
          notesSection.insertBefore(nav, notesSection.firstChild);
        }
        nav.innerHTML =
          '<button class="notes-back" ' + (notesHistory.length === 0 ? 'disabled' : '') + ' title="Précédent">&#8592;</button>' +
          '<button class="notes-forward" ' + (notesFuture.length === 0 ? 'disabled' : '') + ' title="Suivant">&#8594;</button>';
        nav.querySelector('.notes-back').onclick = function() {
          if (notesHistory.length > 0) {
            notesFuture.unshift(currentNote);
            const prev = notesHistory.pop();
            renderNote(prev, false);
          }
        };
        nav.querySelector('.notes-forward').onclick = function() {
          if (notesFuture.length > 0) {
            notesHistory.push(currentNote);
            const next = notesFuture.shift();
            renderNote(next, false);
          }
        };
      }
      // Initialisation automatique sur la première note affichée
      document.addEventListener('DOMContentLoaded', function() {
        // Quand une note est affichée (par clic sur un item principal), on réinitialise l'historique
        document.querySelectorAll('.description-card.has-notes').forEach(item => {
          item.addEventListener('click', function() {
            const notesSection = this.closest('.description-card[data-category]').querySelector('.notes-section');
            if (notesSection) {
              const notesContent = notesSection.querySelector('.notes-content');
              // Chercher le chemin de la note principale (index.md) du dossier courant
              const cat = this.closest('.description-card[data-category]');
              if (cat) {
                const catName = cat.getAttribute('data-category');
                // On tente de retrouver le chemin de la note principale
                let notePath = null;
                for (const k in window.allNotes) {
                  if (k.endsWith('/' + catName + '/index.md')) {
                    notePath = k;
                    break;
                  }
                }
                if (notePath) {
                  notesHistory = [];
                  notesFuture = [];
                  renderNote(notePath, false);
                }
              }
            }
          });
        });
        // Activer les liens dynamiques dans la note affichée par défaut
        document.querySelectorAll('.notes-section .note-link').forEach(link => {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-note');
            if (target) renderNote(target);
          });
        });
      });
    })();
    </script>
</body>
</html>
`;

// Écrire le fichier HTML
fs.writeFileSync('index.html', completeHTML);
console.log('Nouveau fichier index.html généré avec succès!'); 