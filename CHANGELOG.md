# Changelog

## Unreleased

- Vorbereitung der MVP-Phasen 4 bis 6.

## 0.1.0-alpha.5 - 2026-03-13

- Tenant-Portal um Sicht auf Mietaufschluesselung, Verlauf, Dokumente, Mitteilungen und Servicefaelle erweitert.
- Tenant-API-Route und Service-Schicht fuer neue Servicefall-Meldungen implementiert.
- Tenant-Servicefall-Erstellung per Unit-Test abgesichert.
- Playwright-Test fuer den geschuetzten Tenant-Login und das Mieterportal ergaenzt.

## 0.1.0-alpha.4 - 2026-03-13

- Manager-Portal auf echte TanStack-Query- und API-basierte Datenfluesse umgestellt.
- Geschuetzte Manager-API-Routen fuer Objekte, Einheiten, Lease-Updates, Kostenpositionen, Snapshot-Publishing und Servicefall-Status angelegt.
- Service- und Zugriffslogik fuer Manager-Flows mit Audit-Log und Notification-Erzeugung eingefuehrt.
- Unit-Tests fuer Rollen-/Sichtbarkeitsregeln sowie Manager-Service-Flows ergaenzt.
- Manager-Playwright-Flow auf das neue Portal-Dashboard angepasst.

## 0.1.0-alpha.3 - 2026-03-13

- Credentials-Login mit Auth.js, NextAuth-Route-Handler und JWT-Session-Strategie implementiert.
- Session-Typen, Rollen-Helfer und Proxy-Guard fuer geschuetzte Portalrouten angelegt.
- Geschuetzte Routen `/portal`, `/portal/manager` und `/portal/mieter` mit seed-basierten DB-Abfragen aufgebaut.
- Login-Oberflaeche mit React Hook Form und Zod eingefuehrt.
- Playwright-Login-Test fuer den Manager-Flow ergaenzt.

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
