// lib/auth.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { validate_password } from "./password-utils";
import { getUserAgent } from "./user-agent";
import { randomBytes } from "crypto";

const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "test@mail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const {} = await prisma.$transaction([
          prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              roleUsers: {
                select: {
                  roles: {
                    select: {
                      guardName: true,
                    },
                  },
                },
              },
              email: true,
              password: true,
              name: true,
            },
          }),
        ]);
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            roleUsers: {
              select: {
                roles: {
                  select: {
                    guardName: true,
                    permissionRoles: {
                      select: {
                        permissions: {
                          select: {
                            guardName: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            email: true,
            password: true,
            name: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid University ID or Password!");
        }

        const isValid = await validate_password(
          credentials.password,
          user.password,
        );

        if (!isValid) {
          throw new Error("Invalid University ID or Password!");
        }

        const userRoles = user.roleUsers.map((role) => role.roles.guardName);
        const rolePermissions = user.roleUsers.flatMap((roleUser) =>
          roleUser.roles.permissionRoles.map((pr) => pr.permissions.guardName),
        );

        const uniquePermissions = Array.from(new Set(rolePermissions));
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: userRoles,
          permissions: uniquePermissions,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },

  callbacks: {
    // 1. Creates/Updates the JWT (Edge Compatible)
    async jwt({ token, user }) {
      if (user) {
        const { userAgent, ip } = await getUserAgent();
        const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
        const sessionToken = randomBytes(32).toString("hex");

        await prisma.session.create({
          data: {
            userId: user.id,
            userAgent,
            ipAddress: ip,
            expiresAt,
            sessionToken,
          },
        });

        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.permissions = user.permissions;
        token.name = user.name;
        token.token = sessionToken;
        token.invalid = false;
        token.exp = Math.floor(expiresAt.getTime() / 1000);
      }

      if (!token.token) {
        token.invalid = true;
        return token;
      }

      const session = await prisma.session.findUnique({
        where: { sessionToken: token.token },
        select: { expiresAt: true },
      });

      if (!session || session.expiresAt < new Date()) {
        token.invalid = true;
        return token;
      }
      return token;
    },

    // 2. Exposes JWT data to the Client/Server Components
    async session({ session, token }) {
      if (token.invalid) {
        session.user = undefined;
        session.expires = new Date(0).toISOString();
        return session;
      }
      if (session.user && token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role as any;
        session.user.permissions = token.permissions as string[];
        session.user.name = token.name as string;
        session.expires = new Date(token.exp * 1000).toISOString();
      }
      return session;
    },
  },

  // Log logins in the background (Doesn't block edge runtime)
  events: {
    async signIn({ user }) {
      await prisma.log.create({
        data: {
          type: "AUTH_LOGIN_SUCCESS",
          severity: "INFO",
          message: `User ${user.email} logged in.`,
          userId: user.id,
        },
      });
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
