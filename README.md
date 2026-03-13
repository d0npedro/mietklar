# MietKlar

MietKlar ist ein produktionsnahes MVP fuer transparente Vermietung. Die Plattform kombiniert ein oeffentliches SaaS-Frontend mit einem Mieterportal und einem Vermieter-/Verwalterportal. Ziel ist, Mietzusammensetzung, offene Vermietermarge, Kostenhistorie und Service-Kommunikation nachvollziehbar sichtbar zu machen.

## Status

- Phase 1 ist abgeschlossen: Repo, Basisscaffold, Test-Setup, Dokumentation und erste Demo-Oberflaechen stehen.
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
4. `npm run dev`

Hinweis: In Phase 1 ist die Datenbankorchestrierung vorbereitet. Prisma-Schema, Migrationen und Seeds folgen in Phase 2.

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

## Naechste Schritte

- Prisma-Domainmodell und erste Migration anlegen
- Demo-Seed-Daten fuer Manager- und Tenant-Flows aufbauen
- Auth, Rollen und Tenant-Sichtbarkeit implementieren
- Deployment nach Phase 2 mit echter Domainlogik und Datenbasis erweitern
