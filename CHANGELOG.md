# Changelog

## Unreleased

- Vorbereitung der MVP-Phasen 3 bis 6.

## 0.1.0-alpha.2 - 2026-03-13

- Vollstaendiges Prisma-Domainmodell fuer Rollen, Organisationen, Objekte, Leases, Kosten, Snapshots, Servicefaelle, Dokumente, Mitteilungen und Audit-Logs angelegt.
- Erste PostgreSQL-Migration fuer das MVP-Schema erzeugt und lokal angewendet.
- Seed-Daten fuer Demo-Organisation, mehrere Einheiten, Lease, veroeffentlichte Snapshots, Mietaenderung, Servicefall, Dokumente und Mitteilung angelegt.
- Kernlogik fuer Margin-Berechnung, Snapshot-Kalkulation und Delta-Ermittlung implementiert und per Unit-Tests abgesichert.
- Prisma-7-Konfiguration mit `prisma.config.ts` und PostgreSQL-Adapter fuer Laufzeit und Seeds eingerichtet.

## 0.1.0-alpha.1 - 2026-03-13

- Oeffentliches GitHub-Repository `d0npedro/mietklar` angelegt.
- Next.js-App mit TypeScript, Tailwind CSS v4 und shadcn/ui initialisiert.
- Basis fuer TanStack Query, Prisma, Auth.js, Vitest und Playwright im Projekt aufgenommen.
- Projektleitplanken via `AGENTS.md`, Roadmap, Architektur- und Decision-Log dokumentiert.
- Erste mobile-first Demo-Oberflaechen fuer Landing, Tenant- und Manager-Vorschau vorbereitet.
- Erster stabiler Vercel-Deploy unter `https://vermietertool.vercel.app` erstellt.
