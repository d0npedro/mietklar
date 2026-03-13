import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      organizationId: string | null;
      role: Role | null;
    };
  }

  interface User {
    organizationId: string | null;
    role: Role | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    organizationId?: string | null;
    role?: Role | null;
    userId?: string;
  }
}
