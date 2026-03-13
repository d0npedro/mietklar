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

### D-005: Prisma 7 mit `prisma.config.ts` und PostgreSQL-Adapter

Fuer Prisma 7 wird die Datenbankkonfiguration ueber `prisma.config.ts` gepflegt. Zur Laufzeit und fuer Seed-Skripte wird der offizielle PostgreSQL-Adapter `@prisma/adapter-pg` verwendet, damit lokale Migrationen und spaetere App-Zugriffe auf derselben technischen Basis laufen.

### D-006: Auth.js mit Credentials-Provider und JWT-Sessions

Fuer das MVP wird der schnellste robuste Login-Weg ueber einen Credentials-Provider mit lokal gehashten Seed-Passwoertern umgesetzt. JWT-Sessions halten das Setup schlank, waehrend Prisma weiterhin die kanonische Benutzer- und Rollenquelle bleibt.

### D-007: Oeffentliche Preview und geschuetzte Portale parallel

Die oeffentlichen Vorschauseiten unter `/manager` und `/mieter` bleiben fuer Marketing und Demo erhalten, waehrend die echten Portale unter `/portal/*` durch Rollen und Login geschuetzt werden. So bleibt die Online-Demo ohne Cloud-DB nutzbar, waehrend lokal bereits echte Portalfluesse getestet werden koennen.

### D-008: Manager-Schreibfluesse ueber geschuetzte App-API plus Service-Schicht

Die Manager-Mutationen laufen ueber geschuetzte App-API-Routen, die Auth, Zod-Validierung und eine dedizierte Service-Schicht kombinieren. So bleiben Prisma-Operationen testbar, atomare Snapshot-Veröffentlichungen sind transaktional kapselbar und das Client-Dashboard kann mit TanStack Query sauber invalidieren.

### D-009: Tenant-Portal bleibt servergerendert, Servicefall-Meldung wird gezielt clientseitig erweitert

Das Tenant-Portal bleibt fuer die lesenden Hauptinhalte serverseitig einfach und stabil, waehrend nur der Servicefall-Create-Flow als clientseitige Mutation ergänzt wird. Dadurch bleibt die Seite fuer Demo und SSR leichtgewichtig, waehrend ein echter schreibender Tenant-Pfad bereits vorhanden und testbar ist.

### D-010: Prisma-Client wird in Cloud-Builds ueber `postinstall` generiert

Die Vercel-Builds benoetigen ein garantiert erzeugtes Prisma-Client-Paket, weil Typpruefung und Seed-Dateien sonst auf unvollstaendige `@prisma/client`-Exports laufen. Deshalb wird `prisma generate` im `postinstall` verankert, statt sich auf bereits lokal generierte Artefakte zu verlassen.
