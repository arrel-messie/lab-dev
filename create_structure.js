const fs = require('fs');
const path = require('path');

const structure = {
    "Competences techniques": {
        "Langages de programmation": {
            "Java": {},
            "JavaScript": {},
            "Python": {},
            "Shell": {},
            "C++": {},
            "Scala": {},
            "PL/SQL": {},
            "KSQL": {}
        },
        "Frameworks": {
            "Spring": {},
            "Micronaut": {},
            "Quarkus": {},
            "Django": {},
            "Angular": {},
            "VueJS": {},
            "MuleSoft": {}
        },
        "Bibliothèques": {
            "Hibernate": {},
            "OpenApi": {},
            "Kafka": {}
        },
        "Outils de Test  et qualité logiciel": {
            "Junit5": {},
            "Cucumber": {},
            "SonaeQube": {}
        },
        "Outils dev sec ops": {
            "Git": {},
            "Bitbucket": {},
            "GitlabCi": {},
            "Jenkins": {},
            "Docker": {},
            "Kubernetes": {}
        },
        "Outils cloud": {
            "GCP": {}
        },
        "Outils de Modelisation": {
            "UML(draw.io)": {},
            "UI_UX  (figma)": {},
            "Api (RAML YAML)": {}
        },
        "Base de données et moteurs de recherche": {
            "Postgres": {},
            "Oracle": {},
            "Mysql": {},
            "MamngoDB": {},
            "Elasticsearch": {}
        },
        "Architectures logiciel": {
            "Layered": {},
            "Mvc": {},
            "Microservice": {},
            "Hexagonal": {}
        },
        "Principes de l'ingénierie  logiciel": {
            "Solid": {},
            "Clean code": {}
        }
    },
    "Projets MVP": {},
    "Projets POCs": {}
};

function createDirectoryStructure(basePath, structure) {
    for (const [name, content] of Object.entries(structure)) {
        const currentPath = path.join(basePath, name);
        
        // Create directory
        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath, { recursive: true });
        }

        // Create description.json
        const descriptionJson = {
            name: name,
            description: `Description for ${name}`,
            created: new Date().toISOString()
        };

        fs.writeFileSync(
            path.join(currentPath, 'description.json'),
            JSON.stringify(descriptionJson, null, 2)
        );

        // Recursively create subdirectories
        if (Object.keys(content).length > 0) {
            createDirectoryStructure(currentPath, content);
        }
    }
}

// Create the structure
createDirectoryStructure('.', structure);

console.log('Directory structure created successfully!'); 