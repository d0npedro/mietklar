export const demoAccounts = [
  {
    description: "Objekte, Mieten und Service bearbeiten",
    email: "manager@mietklar.demo",
    loginLabel: "Als Verwalter testen",
    previewHref: "/manager",
    previewLabel: "Verwalter-Demo oeffnen",
    role: "manager",
  },
  {
    description: "Miete, Dokumente und Service sehen",
    email: "mieter@mietklar.demo",
    loginLabel: "Als Mieter testen",
    previewHref: "/mieter",
    previewLabel: "Mieter-Demo oeffnen",
    role: "tenant",
  },
] as const;

export function getRecommendedDemoRole(nextPath: string) {
  if (nextPath.includes("/portal/mieter")) {
    return "tenant";
  }

  if (nextPath.includes("/portal/manager")) {
    return "manager";
  }

  return null;
}
