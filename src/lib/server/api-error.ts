import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ManagerServiceError } from "@/lib/server/manager-service";
import { TenantServiceError } from "@/lib/server/tenant-service";

export function toApiErrorResponse(error: unknown) {
  if (error instanceof ManagerServiceError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof TenantServiceError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues[0]?.message ?? "Ungueltige Eingaben." },
      { status: 400 },
    );
  }

  console.error(error);

  return NextResponse.json(
    { error: "Interner Serverfehler." },
    { status: 500 },
  );
}
