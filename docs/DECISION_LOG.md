# Decision Log

## 2026-03-13

### D-001: Next.js App Router als Frontend-Basis

Next.js App Router wurde gewaehlt, weil damit oeffentliche Seiten, geschuetzte Portale, Serverlogik und spaeteres Vercel-Deployment ohne Architekturbruch in einem Projekt umgesetzt werden koennen.

### D-002: Auth.js statt Clerk

Auth.js ist fuer dieses MVP die robustere und schnellere Wahl, weil keine externe Produktkonfiguration notwendig ist und Rollen-/Mandantenlogik direkt mit Prisma integriert werden kann.

### D-003: Lokales PostgreSQL ueber Docker Compose

Docker ist im Workspace verfuegbar. Deshalb wird lokale Entwicklung und Testvorbereitung mit einem reproduzierbaren Postgres-Container aufgesetzt, statt die Datenbank durch einen anderen Provider lokal zu simulieren.

### D-004: Frueher Vercel-Deploy vor Domainlogik

Die erste online verfuegbare Demo wird bereits nach Phase 1 deployed. Dadurch bleiben Routing, UI-Richtung und Build-Pipeline frueh ueberpruefbar, waehrend Prisma, Auth und echte Mandantenlogik in den naechsten Phasen hinzukommen.
