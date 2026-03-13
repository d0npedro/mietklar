import { Clock3, HandCoins, ShieldCheck } from "lucide-react";

export const marketingStats = [
  {
    detail:
      "Jeder relevante Mietblock, jede Marge und jede Anpassung werden explizit erklaert.",
    label: "Transparenzziel",
    trend: "up" as const,
    value: "100 %",
  },
  {
    detail:
      "Ein gemeinsamer Datenraum fuer Tenant-Sicht, Manager-Workflow und Audit-Historie.",
    label: "Datenbasis",
    trend: "neutral" as const,
    value: "1 Quelle",
  },
  {
    detail:
      "Kosten, Servicefaelle, Dokumente und Mitteilungen sind fuer mobile Nutzung vorbereitet.",
    label: "Produktflaechen",
    trend: "up" as const,
    value: "3 Portale",
  },
  {
    detail:
      "Jede weitere Phase bleibt testbar, deploybar und fuer spaetere Sessions nachvollziehbar.",
    label: "Liefermodus",
    trend: "neutral" as const,
    value: "kleine Inkremente",
  },
];

export const transparencyPillars = [
  {
    description:
      "MietKlar trennt externe Objektkosten, umlagefaehige Positionen und offene Vermietermarge sauber voneinander.",
    icon: HandCoins,
    title: "Kosten und Marge getrennt sichtbar",
  },
  {
    description:
      "Tenant-Portale zeigen nicht nur den aktuellen Stand, sondern auch den Weg dorthin ueber Snapshots und Deltas.",
    icon: Clock3,
    title: "Historie statt Ueberraschung",
  },
  {
    description:
      "Rollenschnitt und Mandantengrenzen sind Teil der Kernarchitektur, nicht ein nachgelagerter Filter.",
    icon: ShieldCheck,
    title: "Sichtbarkeit by design",
  },
];

export const portalHighlights = [
  {
    badge: "Verwaltung",
    cta: "Zur Manager-Demo",
    description:
      "Objekte, Einheiten, Kostenpositionen, Snapshots und Veroeffentlichungen in einer Arbeitsflaeche.",
    href: "/manager",
    points: [
      "Kostenstruktur pro Einheit pflegen",
      "Miet-Snapshots berechnen und freigeben",
      "Servicefaelle und Mitteilungen operativ steuern",
    ],
    title: "Vermieter- und Verwalterportal",
  },
  {
    badge: "Transparenz",
    cta: "Zur Mieter-Demo",
    description:
      "Mieter sehen die eigene Miete, ihre Historie, Dokumente, Servicefaelle und Mitteilungen auf einen Blick.",
    href: "/mieter",
    points: [
      "Mietaufschluesselung mit offener Marge",
      "Aenderungsverlauf mit Delta-Erklaerungen",
      "Dokumente und Tickets zentral erreichbar",
    ],
    title: "Mieterportal",
  },
];

export const rentBreakdownPreview = [
  {
    amount: 1190,
    detail: "Instandhaltung, Finanzierung, Versicherung",
    label: "Objektkosten",
    share: 69,
    tone: "primary" as const,
  },
  {
    amount: 360,
    detail: "Energie, Hausservice, externe Versorgung",
    label: "Externe Betriebskosten",
    share: 21,
    tone: "secondary" as const,
  },
  {
    amount: 170,
    detail: "Offen ausgewiesene Vermietermarge",
    label: "Vermietermarge",
    share: 10,
    tone: "accent" as const,
  },
];

export const managerMetrics = [
  {
    delta: "+2 heute",
    detail: "Einheiten mit aktivem Leasing oder laufender Vorbereitung",
    label: "Aktive Einheiten",
    trend: "up" as const,
    value: "12",
  },
  {
    delta: "3 offen",
    detail: "Snapshots warten auf Berechnung oder Freigabe",
    label: "Snapshot-Pipeline",
    trend: "neutral" as const,
    value: "7",
  },
  {
    delta: "-1 gg. Vorwoche",
    detail: "Offene Tickets mit SLA-Relevanz fuer das Objektportfolio",
    label: "Servicefaelle",
    trend: "down" as const,
    value: "4",
  },
  {
    delta: "2 live",
    detail: "Veroeffentlichte Mietaenderungen im aktuellen Abrechnungsfenster",
    label: "Publizierte Aenderungen",
    trend: "up" as const,
    value: "2",
  },
];

export const managerActionCards = [
  {
    description:
      "Eigentuemer, Standorte und Verwaltungseinheiten werden in einer konsistenten Tenant-Struktur organisiert.",
    icon: "Building2",
    title: "Objektlandschaft",
  },
  {
    description:
      "Kostenkategorien, Einzelpositionen und Margenparameter bereiten die spaetere Snapshot-Berechnung vor.",
    icon: "HandCoins",
    title: "Kostenmodelle",
  },
  {
    description:
      "Publizierte Snapshots erzeugen spaeter automatisch Historie, Tenant-Notifications und Audit-Eintraege.",
    icon: "ListChecks",
    title: "Freigabe-Workflow",
  },
  {
    description:
      "Servicefaelle laufen in derselben Oberflaeche zusammen, damit Tenant-Kommunikation und Betrieb nicht auseinanderfallen.",
    icon: "Wrench",
    title: "Servicebetrieb",
  },
];

export const managerWorkQueue = [
  {
    status: "Kostenupdate faellig",
    topic: "Waermeliefervertrag 2026 pruefen und Delta vorbereiten",
    unit: "Haus A / 2. OG links",
  },
  {
    status: "Snapshot berechnen",
    topic: "Neue Instandhaltungsrate fuer Einheit A-03 fixieren",
    unit: "Haus A / A-03",
  },
  {
    status: "Veroeffentlichen",
    topic: "Mietaenderung fuer April 2026 mit Begruendung freigeben",
    unit: "Haus A / B-01",
  },
];

export const tenantMetrics = [
  {
    delta: "-18 EUR",
    detail: "Aktuelle Warmmiete inkl. ausgewiesener Marge",
    label: "Monatsmiete",
    trend: "down" as const,
    value: "1.720 EUR",
  },
  {
    delta: "2 neue",
    detail: "Dokumente und Mitteilungen, die fuer das Lease freigegeben wurden",
    label: "Neue Inhalte",
    trend: "up" as const,
    value: "4",
  },
  {
    delta: "1 offen",
    detail: "Aktuelle Servicefaelle mit sichtbarer Bearbeitungshistorie",
    label: "Servicefaelle",
    trend: "neutral" as const,
    value: "2",
  },
  {
    delta: "vollstaendig",
    detail: "Mietaenderungen im persoenlichen Verlauf nachvollziehbar",
    label: "Historie",
    trend: "up" as const,
    value: "3 Events",
  },
];

export const tenantTimeline = [
  {
    date: "03.03.2026",
    delta: -18,
    detail:
      "Der neue Energievertrag senkt die extern verursachten Betriebskosten. Die offene Vermietermarge bleibt unveraendert.",
    title: "Nebenkostenanpassung",
  },
  {
    date: "12.01.2026",
    delta: 45,
    detail:
      "Eine gestiegene Instandhaltungsrate wurde im Snapshot fixiert und vor Wirksamkeit transparent angekuendigt.",
    title: "Instandhaltungsbudget aktualisiert",
  },
  {
    date: "01.09.2025",
    delta: 0,
    detail:
      "Start des aktuellen Leases mit offen ausgewiesener Marge und initialer Kostenaufteilung.",
    title: "Lease gestartet",
  },
];

export const tenantDocumentsPreview = [
  {
    meta: "PDF | Freigegeben am 03.03.2026",
    title: "Miet-Snapshot Maerz 2026",
    visibility: "Tenant sichtbar",
  },
  {
    meta: "PDF | Freigegeben am 12.01.2026",
    title: "Begruendung Kostenanpassung",
    visibility: "Tenant sichtbar",
  },
  {
    meta: "PDF | Gueltig seit 01.09.2025",
    title: "Mietvertrag",
    visibility: "Tenant sichtbar",
  },
];

export const announcementsPreview = [
  {
    detail:
      "Die Heizungswartung im Haus A findet am 19.03.2026 zwischen 09:00 und 12:00 Uhr statt. Keine Mietanpassung, rein operativer Hinweis.",
    title: "Wartungsfenster Heizung",
  },
  {
    detail:
      "Der Servicefall 'Fensterdichtung' wurde auf den Status 'Techniker geplant' gesetzt. Der Termin ist fuer den 18.03.2026 vorgesehen.",
    title: "Servicefall aktualisiert",
  },
];
