import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AnnouncementAudience,
  AuditAction,
  DocumentVisibility,
  FileKind,
  LeaseStatus,
  MarginType,
  NotificationType,
  OrganizationStatus,
  PrismaClient,
  Role,
  ServiceCasePriority,
  ServiceCaseStatus,
  SnapshotStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

import {
  calculateRentSnapshot,
  generateLeaseDelta,
} from "../src/lib/domain/rent";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({ adapter });

async function clearDatabase() {
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.serviceCaseEvent.deleteMany();
  await prisma.serviceCaseComment.deleteMany();
  await prisma.serviceCase.deleteMany();
  await prisma.leaseChange.deleteMany();
  await prisma.leaseRentSnapshotItem.deleteMany();
  await prisma.leaseRentSnapshot.deleteMany();
  await prisma.leaseCostItem.deleteMany();
  await prisma.leaseTenant.deleteMany();
  await prisma.document.deleteMany();
  await prisma.file.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.propertyAssignment.deleteMany();
  await prisma.property.deleteMany();
  await prisma.costCategory.deleteMany();
  await prisma.leaseChangeReason.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

async function main() {
  await clearDatabase();

  const managerEmail =
    process.env.DEMO_MANAGER_EMAIL ?? "manager@mietklar.demo";
  const managerPassword = process.env.DEMO_MANAGER_PASSWORD ?? "Demo12345!";
  const tenantEmail = process.env.DEMO_TENANT_EMAIL ?? "mieter@mietklar.demo";
  const tenantPassword = process.env.DEMO_TENANT_PASSWORD ?? "Demo12345!";

  const [
    platformAdminPasswordHash,
    ownerPasswordHash,
    managerPasswordHash,
    tenantPasswordHash,
  ] = await Promise.all([
    bcrypt.hash("Demo12345!", 10),
    bcrypt.hash("Demo12345!", 10),
    bcrypt.hash(managerPassword, 10),
    bcrypt.hash(tenantPassword, 10),
  ]);

  const organization = await prisma.organization.create({
    data: {
      name: "MietKlar Demo GmbH",
      slug: "mietklar-demo",
      status: OrganizationStatus.active,
    },
  });

  const [platformAdmin, owner, manager, tenant] = await Promise.all([
    prisma.user.create({
      data: {
        email: "platform@mietklar.demo",
        globalRole: Role.admin_platform,
        name: "Platform Admin",
        passwordHash: platformAdminPasswordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "owner@mietklar.demo",
        name: "Sophie Adler",
        passwordHash: ownerPasswordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: managerEmail,
        name: "Jonas Weber",
        passwordHash: managerPasswordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: tenantEmail,
        name: "Mara Hoffmann",
        passwordHash: tenantPasswordHash,
      },
    }),
  ]);

  const [ownerMember, managerMember] = await Promise.all([
    prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        role: Role.org_owner,
        title: "Geschaeftsfuehrung",
        userId: owner.id,
      },
    }),
    prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        role: Role.property_manager,
        title: "Property Operations",
        userId: manager.id,
      },
    }),
  ]);

  await prisma.organizationMember.create({
    data: {
      organizationId: organization.id,
      role: Role.tenant,
      title: "Mieterin",
      userId: tenant.id,
    },
  });

  const property = await prisma.property.create({
    data: {
      addressLine1: "Lindenstrasse 22",
      city: "Berlin",
      code: "BER-LINDEN-22",
      country: "DE",
      name: "Lindenhof Mitte",
      organizationId: organization.id,
      postalCode: "10115",
    },
  });

  await prisma.propertyAssignment.create({
    data: {
      organizationMemberId: managerMember.id,
      propertyId: property.id,
    },
  });

  const [unitA03, unitB01, unitB02] = await Promise.all([
    prisma.unit.create({
      data: {
        areaSqm: 58.4,
        code: "A-03",
        floor: "2. OG links",
        propertyId: property.id,
        roomCount: 2,
      },
    }),
    prisma.unit.create({
      data: {
        areaSqm: 72.1,
        code: "B-01",
        floor: "1. OG rechts",
        propertyId: property.id,
        roomCount: 3,
      },
    }),
    prisma.unit.create({
      data: {
        areaSqm: 46.8,
        code: "B-02",
        floor: "EG Hof",
        propertyId: property.id,
        roomCount: 2,
      },
    }),
  ]);

  const [propertyCostsCategory, utilitiesCategory] = await Promise.all([
    prisma.costCategory.create({
      data: {
        description: "Instandhaltung, Finanzierung und Versicherungen",
        isExternal: false,
        key: "property_costs",
        name: "Objektkosten",
        organizationId: organization.id,
        sortOrder: 1,
      },
    }),
    prisma.costCategory.create({
      data: {
        description: "Extern verursachte Versorgungs- und Servicekosten",
        isExternal: true,
        key: "utilities",
        name: "Externe Betriebskosten",
        organizationId: organization.id,
        sortOrder: 2,
      },
    }),
  ]);

  const leaseChangeReason = await prisma.leaseChangeReason.create({
    data: {
      code: "utilities_update",
      description: "Anpassung der extern verursachten Nebenkosten",
      label: "Nebenkostenanpassung",
      organizationId: organization.id,
    },
  });

  const lease = await prisma.lease.create({
    data: {
      billingDay: 1,
      currency: "EUR",
      marginType: MarginType.fixed,
      marginValue: 170,
      notes:
        "Demo-Lease fuer Phase 2. Mieter darf spaeter nur dieses Lease sehen.",
      organizationId: organization.id,
      propertyId: property.id,
      reference: "LEASE-A03-2025",
      startDate: new Date("2025-09-01T00:00:00.000Z"),
      status: LeaseStatus.active,
      unitId: unitA03.id,
    },
  });

  await prisma.leaseTenant.create({
    data: {
      isPrimary: true,
      leaseId: lease.id,
      moveInDate: new Date("2025-09-01T00:00:00.000Z"),
      userId: tenant.id,
    },
  });

  const [baseCostItem, previousUtilityItem, currentUtilityItem] =
    await Promise.all([
      prisma.leaseCostItem.create({
        data: {
          amount: 1190,
          costCategoryId: propertyCostsCategory.id,
          effectiveFrom: new Date("2025-09-01T00:00:00.000Z"),
          isExternal: false,
          label: "Objektkosten",
          leaseId: lease.id,
          note: "Langfristige Objektkosten fuer Finanzierung und Instandhaltung.",
        },
      }),
      prisma.leaseCostItem.create({
        data: {
          amount: 378,
          costCategoryId: utilitiesCategory.id,
          effectiveFrom: new Date("2025-09-01T00:00:00.000Z"),
          effectiveTo: new Date("2026-02-28T23:59:59.000Z"),
          isExternal: true,
          label: "Externe Betriebskosten",
          leaseId: lease.id,
          note: "Vor dem neuen Energievertrag gueltige Betriebskosten.",
        },
      }),
      prisma.leaseCostItem.create({
        data: {
          amount: 360,
          costCategoryId: utilitiesCategory.id,
          effectiveFrom: new Date("2026-03-01T00:00:00.000Z"),
          isExternal: true,
          label: "Externe Betriebskosten",
          leaseId: lease.id,
          note: "Anpassung durch den neuen Energie- und Servicevertrag.",
        },
      }),
    ]);

  const previousSnapshot = calculateRentSnapshot({
    components: [
      {
        amount: 1190,
        categoryKey: "property_costs",
        isExternal: false,
        key: "property-costs",
        label: "Objektkosten",
      },
      {
        amount: 378,
        categoryKey: "utilities",
        isExternal: true,
        key: "utilities",
        label: "Externe Betriebskosten",
      },
    ],
    marginType: "fixed",
    marginValue: 170,
  });

  const currentSnapshot = calculateRentSnapshot({
    components: [
      {
        amount: 1190,
        categoryKey: "property_costs",
        isExternal: false,
        key: "property-costs",
        label: "Objektkosten",
      },
      {
        amount: 360,
        categoryKey: "utilities",
        isExternal: true,
        key: "utilities",
        label: "Externe Betriebskosten",
      },
    ],
    marginType: "fixed",
    marginValue: 170,
  });

  const snapshotSourceItems = {
    "property-costs": baseCostItem.id,
    utilities: previousUtilityItem.id,
  };

  const previousSnapshotRecord = await prisma.leaseRentSnapshot.create({
    data: {
      costTotal: previousSnapshot.costTotal,
      currency: "EUR",
      effectiveDate: new Date("2025-09-01T00:00:00.000Z"),
      items: {
        create: previousSnapshot.items.map((item) => ({
          amount: item.amount,
          costCategoryId:
            item.categoryKey === "property_costs"
              ? propertyCostsCategory.id
              : item.categoryKey === "utilities"
                ? utilitiesCategory.id
                : undefined,
          isExternal: item.isExternal,
          isMargin: item.isMargin ?? false,
          label: item.label,
          sharePercent: item.sharePercent,
          sourceCostItemId:
            item.key in snapshotSourceItems
              ? snapshotSourceItems[
                  item.key as keyof typeof snapshotSourceItems
                ]
              : undefined,
        })),
      },
      leaseId: lease.id,
      marginAmount: previousSnapshot.marginAmount,
      organizationId: organization.id,
      publishedAt: new Date("2025-09-01T08:00:00.000Z"),
      publishedById: owner.id,
      rentTotal: previousSnapshot.rentTotal,
      status: SnapshotStatus.published,
      summary:
        "Initialer Miet-Snapshot mit offen ausgewiesener Vermietermarge.",
      version: 1,
    },
  });

  const currentSnapshotRecord = await prisma.leaseRentSnapshot.create({
    data: {
      costTotal: currentSnapshot.costTotal,
      currency: "EUR",
      effectiveDate: new Date("2026-03-01T00:00:00.000Z"),
      items: {
        create: currentSnapshot.items.map((item) => ({
          amount: item.amount,
          costCategoryId:
            item.categoryKey === "property_costs"
              ? propertyCostsCategory.id
              : item.categoryKey === "utilities"
                ? utilitiesCategory.id
                : undefined,
          isExternal: item.isExternal,
          isMargin: item.isMargin ?? false,
          label: item.label,
          sharePercent: item.sharePercent,
          sourceCostItemId:
            item.key === "property-costs"
              ? baseCostItem.id
              : item.key === "utilities"
                ? currentUtilityItem.id
                : undefined,
        })),
      },
      leaseId: lease.id,
      marginAmount: currentSnapshot.marginAmount,
      organizationId: organization.id,
      publishedAt: new Date("2026-03-03T09:00:00.000Z"),
      publishedById: manager.id,
      rentTotal: currentSnapshot.rentTotal,
      status: SnapshotStatus.published,
      summary:
        "Aktueller Miet-Snapshot nach Senkung der extern verursachten Betriebskosten.",
      version: 2,
    },
  });

  const delta = generateLeaseDelta({
    current: currentSnapshot,
    previous: previousSnapshot,
  });

  const leaseChange = await prisma.leaseChange.create({
    data: {
      deltaAmount: delta.totalDelta,
      description:
        "Der neue Energievertrag reduziert die extern verursachten Betriebskosten. Die offene Vermietermarge bleibt unveraendert sichtbar.",
      effectiveDate: new Date("2026-03-01T00:00:00.000Z"),
      leaseId: lease.id,
      organizationId: organization.id,
      previousSnapshotId: previousSnapshotRecord.id,
      publishedAt: new Date("2026-03-03T09:00:00.000Z"),
      publishedById: manager.id,
      reasonId: leaseChangeReason.id,
      snapshotId: currentSnapshotRecord.id,
      title: "Nebenkostenanpassung Maerz 2026",
    },
  });

  const serviceCase = await prisma.serviceCase.create({
    data: {
      assignedToId: manager.id,
      caseNumber: "SC-2026-001",
      createdById: tenant.id,
      description:
        "Die Dichtung am Schlafzimmerfenster zieht stark bei Wind und fuehrt zu Zugluft.",
      leaseId: lease.id,
      organizationId: organization.id,
      priority: ServiceCasePriority.medium,
      propertyId: property.id,
      status: ServiceCaseStatus.in_progress,
      title: "Fensterdichtung Schlafzimmer",
      unitId: unitA03.id,
    },
  });

  await prisma.serviceCaseComment.createMany({
    data: [
      {
        authorId: tenant.id,
        body: "Das Problem tritt seit Ende Februar auf und ist besonders nachts spuerbar.",
        serviceCaseId: serviceCase.id,
      },
      {
        authorId: manager.id,
        body: "Techniker wurde fuer den 18.03.2026 angefragt. Rueckmeldung folgt nach Terminbestaetigung.",
        serviceCaseId: serviceCase.id,
      },
    ],
  });

  await prisma.serviceCaseEvent.createMany({
    data: [
      {
        actorId: tenant.id,
        detail: "Servicefall durch Tenant angelegt.",
        serviceCaseId: serviceCase.id,
        toStatus: ServiceCaseStatus.open,
        type: "case_created",
      },
      {
        actorId: manager.id,
        detail:
          "Technikertermin vorbereitet und Rueckfrage an Vendor gesendet.",
        fromStatus: ServiceCaseStatus.open,
        serviceCaseId: serviceCase.id,
        toStatus: ServiceCaseStatus.in_progress,
        type: "status_changed",
      },
    ],
  });

  const [snapshotFile, changeExplanationFile] = await Promise.all([
    prisma.file.create({
      data: {
        fileName: "miet-snapshot-maerz-2026.pdf",
        kind: FileKind.document,
        mimeType: "application/pdf",
        organizationId: organization.id,
        sizeBytes: 142_880,
        storageKey: "demo/lease-a03/miet-snapshot-maerz-2026.pdf",
        uploadedById: manager.id,
      },
    }),
    prisma.file.create({
      data: {
        fileName: "begruendung-kostenanpassung-maerz-2026.pdf",
        kind: FileKind.document,
        mimeType: "application/pdf",
        organizationId: organization.id,
        sizeBytes: 96_410,
        storageKey: "demo/lease-a03/begruendung-kostenanpassung-maerz-2026.pdf",
        uploadedById: manager.id,
      },
    }),
  ]);

  const [snapshotDocument, explanationDocument] = await Promise.all([
    prisma.document.create({
      data: {
        createdById: manager.id,
        description:
          "Veroeffentlichter Snapshot mit Mietzusammensetzung, Kostenbloeken und offener Marge.",
        fileId: snapshotFile.id,
        leaseId: lease.id,
        organizationId: organization.id,
        propertyId: property.id,
        publishedAt: new Date("2026-03-03T09:10:00.000Z"),
        title: "Miet-Snapshot Maerz 2026",
        unitId: unitA03.id,
        visibility: DocumentVisibility.tenant,
      },
    }),
    prisma.document.create({
      data: {
        createdById: manager.id,
        description:
          "Erklaerung zur Senkung der extern verursachten Betriebskosten ab Maerz 2026.",
        fileId: changeExplanationFile.id,
        leaseId: lease.id,
        organizationId: organization.id,
        propertyId: property.id,
        publishedAt: new Date("2026-03-03T09:10:00.000Z"),
        title: "Begruendung Kostenanpassung",
        unitId: unitA03.id,
        visibility: DocumentVisibility.tenant,
      },
    }),
  ]);

  const announcement = await prisma.announcement.create({
    data: {
      audience: AnnouncementAudience.tenants,
      content:
        "Die Heizungswartung fuer den Lindenhof Mitte findet am 19.03.2026 zwischen 09:00 und 12:00 Uhr statt.",
      leaseId: lease.id,
      organizationId: organization.id,
      propertyId: property.id,
      publishedAt: new Date("2026-03-10T08:00:00.000Z"),
      publishedById: manager.id,
      title: "Wartungsfenster Heizung",
      unitId: unitA03.id,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        announcementId: announcement.id,
        body: "Neue Mitteilung fuer dein Lease im Lindenhof Mitte.",
        leaseId: lease.id,
        linkPath: "/mieter/mitteilungen",
        organizationId: organization.id,
        title: "Neue Mitteilung verfuegbar",
        type: NotificationType.announcement_published,
        userId: tenant.id,
      },
      {
        body: "Der Miet-Snapshot Maerz 2026 wurde fuer das Lease A-03 veroeffentlicht.",
        documentId: snapshotDocument.id,
        leaseChangeId: leaseChange.id,
        leaseId: lease.id,
        linkPath: "/mieter/miete",
        organizationId: organization.id,
        title: "Miet-Snapshot veroeffentlicht",
        type: NotificationType.snapshot_published,
        userId: tenant.id,
      },
      {
        body: "Servicefall SC-2026-001 wurde auf 'in Bearbeitung' gesetzt.",
        leaseId: lease.id,
        linkPath: "/mieter/servicefaelle",
        organizationId: organization.id,
        serviceCaseId: serviceCase.id,
        title: "Servicefall aktualisiert",
        type: NotificationType.service_case_updated,
        userId: tenant.id,
      },
      {
        body: "Tenant-Dokument 'Begruendung Kostenanpassung' wurde freigegeben.",
        documentId: explanationDocument.id,
        leaseId: lease.id,
        linkPath: "/manager/dokumente",
        organizationId: organization.id,
        title: "Dokument freigegeben",
        type: NotificationType.document_shared,
        userId: manager.id,
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        action: AuditAction.publish,
        actorId: manager.id,
        entityId: currentSnapshotRecord.id,
        entityType: "LeaseRentSnapshot",
        leaseId: lease.id,
        metadata: { version: 2 },
        organizationId: organization.id,
        propertyId: property.id,
        snapshotId: currentSnapshotRecord.id,
        summary: "Snapshot Version 2 fuer Lease A-03 veroeffentlicht.",
        unitId: unitA03.id,
      },
      {
        action: AuditAction.publish,
        actorId: manager.id,
        announcementId: announcement.id,
        entityId: announcement.id,
        entityType: "Announcement",
        organizationId: organization.id,
        propertyId: property.id,
        summary: "Tenant-Mitteilung fuer Wartungsfenster veroeffentlicht.",
        unitId: unitA03.id,
      },
      {
        action: AuditAction.status_change,
        actorId: manager.id,
        entityId: serviceCase.id,
        entityType: "ServiceCase",
        organizationId: organization.id,
        propertyId: property.id,
        serviceCaseId: serviceCase.id,
        summary: "Servicefall SC-2026-001 auf in_progress gesetzt.",
        unitId: unitA03.id,
      },
      {
        action: AuditAction.create,
        actorId: owner.id,
        entityId: lease.id,
        entityType: "Lease",
        leaseId: lease.id,
        organizationId: organization.id,
        propertyId: property.id,
        summary: "Demo-Lease LEASE-A03-2025 angelegt.",
        unitId: unitA03.id,
      },
    ],
  });

  console.info("Seed completed.");
  console.info(`Organization: ${organization.slug}`);
  console.info(`Manager login: ${managerEmail} / ${managerPassword}`);
  console.info(`Tenant login: ${tenantEmail} / ${tenantPassword}`);
  console.info(
    `Additional users: owner@mietklar.demo / Demo12345!, platform@mietklar.demo / Demo12345!`,
  );

  void platformAdmin;
  void ownerMember;
  void unitB01;
  void unitB02;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
