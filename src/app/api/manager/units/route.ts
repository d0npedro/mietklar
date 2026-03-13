import { NextResponse } from "next/server";

import { auth, isManagerRole } from "@/lib/auth";
import { toApiErrorResponse } from "@/lib/server/api-error";
import { createManagerService } from "@/lib/server/manager-service";
import { createUnitSchema } from "@/lib/validation/manager";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  if (!isManagerRole(session.user.role)) {
    return NextResponse.json({ error: "Kein Zugriff." }, { status: 403 });
  }

  try {
    const input = createUnitSchema.parse(await request.json());
    const result = await createManagerService().createUnit(
      session.user.id,
      input,
    );

    return NextResponse.json({
      message: "Einheit angelegt.",
      result,
    });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
