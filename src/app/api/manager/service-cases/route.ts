import { NextResponse } from "next/server";

import { auth, isManagerRole } from "@/lib/auth";
import { toApiErrorResponse } from "@/lib/server/api-error";
import { createManagerService } from "@/lib/server/manager-service";
import { updateServiceCaseStatusSchema } from "@/lib/validation/manager";

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  if (!isManagerRole(session.user.role)) {
    return NextResponse.json({ error: "Kein Zugriff." }, { status: 403 });
  }

  try {
    const input = updateServiceCaseStatusSchema.parse(await request.json());
    const result = await createManagerService().updateServiceCaseStatus(
      session.user.id,
      input,
    );

    return NextResponse.json({
      message: "Servicefall aktualisiert.",
      result,
    });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
