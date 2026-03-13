# MietKlar

MietKlar ist ein produktionsnahes MVP fuer transparente Vermietung. Die Plattform kombiniert ein oeffentliches SaaS-Frontend mit einem Mieterportal und einem Vermieter-/Verwalterportal. Ziel ist, Mietzusammensetzung, offene Vermietermarge, Kostenhistorie und Service-Kommunikation nachvollziehbar sichtbar zu machen.

## Status

- Phase 1 ist abgeschlossen: Repo, Basisscaffold, Test-Setup, Dokumentation und erste Demo-Oberflaechen stehen.
- Phase 2 ist abgeschlossen: Prisma-Domainmodell, lokale Migration, Seed-Daten und Kernlogik fuer Margin, Snapshot und Delta sind implementiert.
- Phase 3 ist abgeschlossen: Credentials-Login, Session-Handling, Rollenwachen und geschuetzte Portalrouten sind lokal verifiziert.
- Phase 4 ist abgeschlossen: Manager-Portal mit Objekt-/Einheitsverwaltung, Lease-Konfiguration, Kostenpositionen, Snapshot-Publishing, Servicefall-Statusupdates und Audit-Log ist implementiert.
- Phase 5 ist abgeschlossen: Mieterportal mit Mietaufschluesselung, Verlauf, Dokumenten, Mitteilungen und Servicefall-Meldung ist implementiert.
- GitHub-Repository: [d0npedro/mietklar](https://github.com/d0npedro/mietklar)
- Vercel-Demo: [vermietertool.vercel.app](https://vermietertool.vercel.app)

## Geplanter Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Prisma + PostgreSQL
- Auth.js
- TanStack Query
- React Hook Form + Zod
- Vitest
- Playwright
- Vercel

## Lokales Setup

1. `npm install`
2. `.env.example` nach `.env` kopieren und Werte setzen.
3. `npm run db:start`
4. `npm run prisma:migrate -- --name local_setup`
5. `npm run prisma:seed`
6. `npm run dev`

Hinweis: Das Repo ist aktuell lokal voll mit PostgreSQL und Credentials-Login nutzbar. Die oeffentliche Vercel-Demo zeigt weiterhin die statische Vorschau; der Login-Bereich weist online transparent darauf hin, dass fuer produktive Portalnutzung spaeter `DATABASE_URL`, `NEXTAUTH_SECRET` und `NEXTAUTH_URL` in Vercel benoetigt werden.

## Verfuegbare Skripte

- `npm run dev`: lokale Entwicklung auf `http://127.0.0.1:3000`
- `npm run build`: Produktionsbuild
- `npm run start`: Start des Produktionsservers
- `npm run lint`: ESLint
- `npm run typecheck`: TypeScript-Pruefung
- `npm run format`: Prettier mit Tailwind-Sortierung
- `npm run test`: Vitest
- `npm run test:unit`: Vitest mit Coverage
- `npm run test:e2e`: Playwright
- `npm run db:start`: lokales PostgreSQL via Docker Compose starten
- `npm run db:stop`: lokales PostgreSQL stoppen
- `npm run prisma:migrate`: Prisma-Migrationen lokal anwenden
- `npm run prisma:seed`: Demo-Daten erzeugen
- `npm run prisma:studio`: Prisma Studio starten

## Produktfokus

- Mandantenfaehige Organisations- und Rollenlogik
- Transparente Mietaufschluesselung mit offener Vermietermarge
- Historisierte Miet-Snapshots und Mietaenderungen
- Servicefaelle mit Statusverlauf
- Dokumente, Mitteilungen und Auditierbarkeit

## Dokumentation

- [AGENTS.md](./AGENTS.md)
- [Architektur](./docs/ARCHITECTURE.md)
- [Roadmap](./docs/ROADMAP.md)
- [Decision Log](./docs/DECISION_LOG.md)
- [Changelog](./CHANGELOG.md)

## Seed-Daten

- Demo-Organisation: `mietklar-demo`
- Property: `Lindenhof Mitte`
- Einheiten: `A-03`, `B-01`, `B-02`
- Seed-Logins: `manager@mietklar.demo / Demo12345!`, `mieter@mietklar.demo / Demo12345!`
- Weitere Demo-User: `owner@mietklar.demo / Demo12345!`, `platform@mietklar.demo / Demo12345!`

## Geschuetzte Routen

- `/login`: Credentials-Login mit Demo-Zugaengen
- `/portal`: rollengesteuerter Einstieg
- `/portal/manager`: geschuetzte Manager-Sicht mit Mutationen fuer Objekte, Einheiten, Leases, Kostenpositionen, Snapshots und Servicefaelle
- `/portal/mieter`: geschuetzte Tenant-Sicht

## Teststatus

- Unit-Tests decken Margin-Berechnung, Snapshot-Kalkulation, Delta-Generierung, Rollen-/Sichtbarkeitsregeln sowie Manager-Service-Flows fuer Kostenpositionen, Snapshot-Historie und Servicefall-Status ab.
- Unit-Tests decken zusaetzlich die Tenant-Servicefall-Erstellung ab.
- Playwright prueft Marketing-Sichten sowie Manager- und Tenant-Login bis in die geschuetzten Portale.
- Letzter gruen verifizierter Satz: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run test:e2e`

## Naechste Schritte

- Demo-Flows und Seed-Daten fuer Tenant- und Manager-Aktionen weiter polieren
- Sichtbarkeitsregeln und Notification-Ausspielung weiter in Richtung produktiver Mehrmandantenfaehigkeit haerten
- Vercel-Deployment fuer produktive Portalnutzung mit Cloud-DB und Auth-Variablen erweitern
- Deployment nach Auth- und Datenanbindung mit produktnahen Environment-Variablen erweitern
