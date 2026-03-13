import { redirect } from "next/navigation";

import { auth, canAccessTenantPortal, isManagerRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PortalEntryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?next=/portal");
  }

  if (isManagerRole(session.user.role)) {
    redirect("/portal/manager");
  }

  if (canAccessTenantPortal(session.user.role)) {
    redirect("/portal/mieter");
  }

  redirect("/login");
}
