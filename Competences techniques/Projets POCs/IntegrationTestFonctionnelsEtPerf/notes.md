```mermaid
flowchart TD
    A[User] -->|Trigger| B[CI/CD Pipeline]
    B --> C[Squash TM]
    C --> D[Selenium Tests]
    C --> E[OctoPerf Load Tests]
    D --> F[Test Reports]
    E --> F
    F --> G[Decision Point]
    G -->|Success| H[Deploy to Production]
    G -->|Failure| I[Debug and Fix]
    I --> B
```
