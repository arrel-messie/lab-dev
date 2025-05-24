# Tests d'Intégration et de Performance

Voici un exemple de note principale sur les tests d'intégration et de performance.

Pour en savoir plus sur les tests de charge, consultez [cette note dédiée](note:Competences techniques/IntegrationTestFonctionnelsEtPerf/charge.md).

```mermaid
graph TD
A[Utilisateur] -->|Déclenche| B[Pipeline CI/CD]
B --> C[Squash TM]
C --> D[Tests Selenium]
C --> E[Tests OctoPerf]
D --> D1[Tests UI]
D --> D2[Tests API]
D --> D3[Tests E2E]
E --> E1[Tests de Charge]
E --> E2[Tests de Stress]
E --> E3[Tests de Scalabilité]
D1 & D2 & D3 --> F[Rapports de Tests]
E1 & E2 & E3 --> F
F --> G[Point de Décision]
G -->|Succès| H[Déploiement en Production]
G -->|Échec| I[Débogage et Correction]
I -->|Retour| B
``` 