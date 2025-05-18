#!/bin/bash

# Fonction pour créer un fichier notes.md avec un contenu minimal
create_notes() {
    local dir=$1
    local name=$(basename "$dir")
    local notes_file="$dir/notes.md"
    
    # Ne pas écraser les fichiers existants
    if [ -f "$notes_file" ]; then
        echo "Le fichier $notes_file existe déjà"
        return
    }
    
    echo "Création de $notes_file"
    cat > "$notes_file" << EOF
# $name

## Description détaillée
- Expertise approfondie
- Expérience pratique
- Projets réalisés

## Compétences spécifiques
- Conception et architecture
- Implémentation
- Optimisation
- Maintenance

## Réalisations notables
- Projets significatifs
- Améliorations apportées
- Résultats obtenus
EOF
}

# Trouver tous les dossiers avec description.json et créer notes.md
find . -name "description.json" -exec dirname {} \; | while read dir; do
    create_notes "$dir"
done

echo "Création des fichiers notes.md terminée" 