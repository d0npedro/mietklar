import { redirect } from "next/navigation";

import { ManagerDashboard } from "@/components/manager/manager-dashboard";
import { auth, isManagerRole } from "@/lib/auth";
import { getManagerPortalData } from "@/lib/server/portal-queries";

export const dynamic = "force-dynamic";

export default async function PortalManagerPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?next=/portal/manager");
  }

  if (!isManagerRole(session.user.role)) {
    redirect("/portal");
  }

  const data = await getManagerPortalData(session.user.id);

  if (!data) {
    redirect("/portal");
  }

  return (
    <ManagerDashboard
      initialData={data}
      userName={session.user.name ?? session.user.email ?? "Unbekannt"}
      userRole={session.user.role ?? "property_manager"}
    />
  );
}
