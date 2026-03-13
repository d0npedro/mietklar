# MietKlar

MietKlar ist ein produktionsnahes MVP fuer transparente Vermietung. Die Plattform kombiniert ein oeffentliches SaaS-Frontend mit einem Mieterportal und einem Vermieter-/Verwalterportal. Ziel ist, Mietzusammensetzung, offene Vermietermarge, Kostenhistorie und Service-Kommunikation nachvollziehbar sichtbar zu machen.

## Status

- Phase 1 ist abgeschlossen: Repo, Basisscaffold, Test-Setup, Dokumentation und erste Demo-Oberflaechen stehen.
- Phase 2 ist abgeschlossen: Prisma-Domainmodell, lokale Migration, Seed-Daten und Kernlogik fuer Margin, Snapshot und Delta sind implementiert.
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

Hinweis: Das Repo ist aktuell lokal voll mit PostgreSQL nutzbar. Die oeffentliche Vercel-Demo zeigt weiterhin die statische Phase-1-Oberflaeche, bis spaetere Phasen DB-gebundene Routen und passende Produktions-Environment-Variablen nutzen.

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

## Naechste Schritte

- Auth, Rollen und Tenant-Sichtbarkeit implementieren
- DB-Daten in geschuetzte Portale und Dashboards integrieren
- Deployment nach Auth- und Datenanbindung mit produktnahen Environment-Variablen erweitern
