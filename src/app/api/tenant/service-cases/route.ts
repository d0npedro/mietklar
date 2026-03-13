import { NextResponse } from "next/server";

import { auth, canAccessTenantPortal } from "@/lib/auth";
import { toApiErrorResponse } from "@/lib/server/api-error";
import { createTenantService } from "@/lib/server/tenant-service";
import { createTenantServiceCaseSchema } from "@/lib/validation/tenant";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Nicht angemeldet." },
      { status: 401 },
    );
  }

  if (!canAccessTenantPortal(session.user.role)) {
    return NextResponse.json({ error: "Kein Zugriff." }, { status: 403 });
  }

  try {
    const input = createTenantServiceCaseSchema.parse(await request.json());
    const result = await createTenantService().createServiceCase(
      session.user.id,
      input,
    );

    return NextResponse.json({
      message: "Servicefall angelegt.",
      result,
    });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
