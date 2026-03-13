import { compare } from "bcryptjs";
import { Role } from "@prisma/client";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { getDb } from "@/lib/db";
import { loginSchema } from "@/lib/validation/auth";

const managerRoles = new Set<Role>([
  Role.admin_platform,
  Role.org_owner,
  Role.org_manager,
  Role.property_manager,
]);

function deriveRole(user: {
  globalRole: Role | null;
  memberships: Array<{ organizationId: string; role: Role }>;
}) {
  return user.globalRole ?? user.memberships[0]?.role ?? null;
}

function deriveOrganizationId(user: {
  memberships: Array<{ organizationId: string; role: Role }>;
}) {
  return user.memberships[0]?.organizationId ?? null;
}

export function isManagerRole(role: Role | null | undefined) {
  return role ? managerRoles.has(role) : false;
}

export function canAccessTenantPortal(role: Role | null | undefined) {
  return role === Role.tenant || role === Role.admin_platform;
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.organizationId = user.organizationId;
        token.role = user.role;
        token.userId = user.id;

        return token;
      }

      if (token.userId && (!token.role || !token.organizationId)) {
        const dbUser = await getDb().user.findUnique({
          include: {
            memberships: {
              orderBy: { createdAt: "asc" },
              select: { organizationId: true, role: true },
              take: 1,
            },
          },
          where: { id: token.userId },
        });

        if (dbUser) {
          token.organizationId = deriveOrganizationId(dbUser);
          token.role = deriveRole(dbUser);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId;
        session.user.organizationId = token.organizationId ?? null;
        session.user.role = token.role ?? null;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      name: "E-Mail und Passwort",
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const dbUser = await getDb().user.findUnique({
          include: {
            memberships: {
              orderBy: { createdAt: "asc" },
              select: { organizationId: true, role: true },
              take: 1,
            },
          },
          where: { email: parsed.data.email },
        });

        if (!dbUser?.passwordHash) {
          return null;
        }

        const isValidPassword = await compare(
          parsed.data.password,
          dbUser.passwordHash,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          email: dbUser.email,
          id: dbUser.id,
          name: dbUser.name,
          organizationId: deriveOrganizationId(dbUser),
          role: deriveRole(dbUser),
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

export function auth() {
  return getServerSession(authOptions);
}
