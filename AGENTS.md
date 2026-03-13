# AGENTS.md

## Produktziel

MietKlar ist ein mandantenfaehiges SaaS-MVP fuer transparente Vermietung. Das Produkt macht Mietzusammensetzung, externe Kosten, offene Vermietermarge, Aenderungshistorie, Dokumente, Servicefaelle und Mitteilungen fuer Mieter nachvollziehbar und gibt Vermietern/Verwaltern ein operatives Portal fuer Pflege, Freigabe und Historisierung.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Prisma
- PostgreSQL
- Auth.js mit Prisma Adapter
- TanStack Query
- React Hook Form + Zod
- Vitest
- Playwright
- Deployment auf Vercel

## Architekturprinzipien

- Multi-Tenancy zuerst: Organisation ist die Hauptgrenze fuer Daten und Rechte.
- Transparent by design: Miete wird immer in Kostenbloecke plus offene Marge zerlegt.
- Immutable history: veroeffentlichte Snapshots und Aenderungsereignisse werden nicht ueberschrieben.
- Mobile-first: jede neue Seite muss auf kleinen Screens zuerst funktionieren.
- Progressive delivery: jede Teilphase bleibt lauffaehig, testbar, commitbar und deploybar.
- Defensive defaults: wenn Datenbank oder Auth nicht verfuegbar sind, darf die oeffentliche Demo nicht komplett ausfallen.

## Coding-Standards

- Strikte TypeScript-Typisierung, keine stillen `any`.
- Kleine, klar benannte Module mit fokussierter Verantwortung.
- Serverlogik in `src/lib` oder dedizierten Servermodulen kapseln, UI-Komponenten praesentationsorientiert halten.
- Deutsche Klartextlabels in der UI, englische technische Bezeichner im Code.
- Bestehende Patterns erweitern statt parallele Abstraktionen einzufuehren.
- Nur ASCII in manuell erstellten Dateien verwenden.

## Test-Standards

- Jede relevante Feature-Erweiterung braucht passende Tests.
- Unit-Tests fuer Berechnungen und Rechte-Logik sind Pflicht.
- Integration-Tests fuer kritische Flows mit Daten- und Rollenbezug sind Pflicht.
- Playwright deckt die wichtigsten Hauptpfade und Smoke-Checks ab.
- Vor Commit mindestens die direkt betroffenen Tests, `npm run lint` und `npm run typecheck` ausfuehren.

## Commit- und Push-Regeln

- Kleine, fokussierte Commits mit klarer Message.
- Nach jeder abgeschlossenen Teilphase sofort committen und nach `origin/main` pushen.
- Keine Sammelcommits am Ende.
- Dokumentationsaenderungen gemeinsam mit dem passenden Code committen.

## Regeln fuer DB-Migrationen

- Schemaaenderungen nur ueber Prisma verwalten.
- Vor jeder Migration den Ist-Zustand pruefen und Migrationsnamen fachlich benennen.
- Seeds nach Schemaaenderungen aktualisieren.
- Keine manuell geaenderten Produktionsdaten als Ersatz fuer Migrationen.

## Regeln fuer Environment-Variablen

- Neue Variablen immer zuerst in `.env.example` dokumentieren.
- Secrets nie committen.
- Demo- oder Fallback-Verhalten klar kennzeichnen, wenn produktive Variablen fehlen.
- Vercel-Umgebungsvariablen nach relevanten Backend-Aenderungen synchron halten.

## Definition of Done

- Feature ist implementiert, getestet und dokumentiert.
- Mobile Ansicht ist sinnvoll nutzbar.
- Relevante Rollen-/Sichtbarkeitsregeln sind abgesichert.
- README, AGENTS, CHANGELOG und Decision Log sind bei Bedarf aktualisiert.
- Aenderungen sind committed, gepusht und bei groesseren Meilensteinen deployed.

## Aktuelle Roadmap

1. Phase 1: abgeschlossen. Repo, Basis-Scaffold, Dokumentation, Test-Setup, erste Produktoberflaeche und Vercel-Deploy.
2. Phase 2: abgeschlossen. Prisma-Schema, Migrationen, Seeds, Berechnungslogik und Unit-Tests.
3. Phase 3: als naechstes. Auth, Rollen, Memberships, Guards, geschuetzte Routen.
4. Phase 4: Manager-Portal, Snapshot-Workflow, Mietaenderungen, Integrationstests.
5. Phase 5: Tenant-Portal, Sichtbarkeit, Servicefaelle, Dokumente, Mitteilungen, Tests.
6. Phase 6: Demo-Polish, vollstaendige E2E-Abdeckung, Vercel-Finalisierung, Restdokumentation.

## Arbeitsmodus fuer Fortsetzung

Wenn eine spaetere Session mit "Entwickel weiter" startet, gilt diese Reihenfolge:

1. `git status --short --branch` ausfuehren.
2. `AGENTS.md`, `README.md`, `CHANGELOG.md`, `docs/ROADMAP.md` und `docs/DECISION_LOG.md` lesen.
3. Die letzten Commits pruefen und offene TODOs oder Roadmap-Punkte identifizieren.
4. Vor jeder Weiterentwicklung den aktuellen Deploy-Status und Test-Status pruefen.
5. Die naechste kleinste lauffaehige Teilphase umsetzen.
6. Nach relevanten Aenderungen Tests ausfuehren, Dokumentation aktualisieren, committen, pushen, falls sinnvoll neu deployen.

## Pflicht vor jeder Weiterentwicklung

- Immer erst den Ist-Zustand des Repos, der Dokumentation, der Tests und der offenen Phasen pruefen.
- Keine bestehenden Nutzer-Aenderungen ueberschreiben, ohne den Kontext verstanden zu haben.

## Dokumentationspflicht

Nach jeder relevanten Aenderung README, AGENTS.md, CHANGELOG.md und `docs/DECISION_LOG.md` aktualisieren, wenn sich Status, Entscheidungen, Setup oder naechste Schritte geaendert haben.
