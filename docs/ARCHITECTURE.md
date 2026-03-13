# Architektur

## Zielbild

MietKlar wird als mandantenfaehiges SaaS-MVP aufgebaut. Eine Organisation kapselt Mitgliedschaften, Objekte, Einheiten, Mietverhaeltnisse, Kostenmodelle, Servicefaelle, Dokumente, Mitteilungen und Audit-Events.

## Architekturprinzipien

- Multi-Tenant by default: Jede fachliche Entitaet ist einer Organisation zugeordnet oder ueber diese ableitbar.
- Read and explain: Jede veroeffentlichte Mietaenderung muss fuer den Mieter nachvollziehbar aufgeloest werden koennen.
- Immutable publication: veroeffentlichte Snapshots und Delta-Ereignisse bleiben unveraenderlich.
- Role-scoped access: `tenant` sieht nur eigene Leases, Management-Rollen sehen nur ihre Organisationsdaten.
- Offline-friendly development: lokale Entwicklung mit Docker-Postgres; Deployment faellt kontrolliert auf Demo-Mode zurueck, falls keine Cloud-DB gesetzt ist.

## App-Surfaces

- Oeffentliche Landing Page mit Produktnutzen und Demo-Einstiegen
- Manager-Portal fuer Betrieb und Freigaben
- Tenant-Portal fuer Transparenz, Dokumente, Service und Kommunikation
- API-/Server-Layer fuer Domainlogik, Auth und Datenzugriff

## Geplante Kernmodule

1. Auth und Rollen
2. Organisationen und Memberships
3. Objekte
4. Einheiten
5. Mietverhaeltnisse
6. Kostenkategorien und Kostenpositionen
7. Miet-Snapshots und Mietaenderungen
8. Servicefaelle
9. Dokumente und Dateien
10. Mitteilungen und Notifications
11. Audit-Log

## Frontend-Struktur

- `src/app`: Routen und Layouts
- `src/components`: UI-Bausteine und produktnahe Komponenten
- `src/lib`: Domainlogik, Hilfsfunktionen, Demo- und spaeter DB-Adapter
- `e2e`: Playwright-Tests
- `docs`: Architektur, Roadmap, Entscheidungen

## Teststrategie

- Unit-Tests fuer Kalkulation, Delta-Ermittlung, Sichtbarkeitsregeln
- Integration-Tests fuer kritische Management- und Tenant-Flows
- Playwright fuer Hauptseiten, Demo-Navigation und spaeter Auth-Flows
