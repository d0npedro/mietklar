import { NextResponse } from "next/server";

import { auth, isManagerRole } from "@/lib/auth";
import { getManagerPortalData } from "@/lib/server/portal-queries";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  if (!isManagerRole(session.user.role)) {
    return NextResponse.json({ error: "Kein Zugriff." }, { status: 403 });
  }

  const data = await getManagerPortalData(session.user.id);

  if (!data) {
    return NextResponse.json(
      { error: "Keine Manager-Daten verfuegbar." },
      { status: 404 },
    );
  }

  return NextResponse.json(data);
}
