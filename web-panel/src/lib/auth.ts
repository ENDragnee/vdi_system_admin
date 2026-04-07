import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { validate_password } from "./password-utils";
import { getUserAgent } from "./user-agent";
import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";

const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            roleUsers: {
              include: {
                roles: {
                  include: {
                    permissionRoles: {
                      include: {
                        permissions: true,
                      },
                    },
                  },
                },
              },
            },
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

        const userRoles = user.roleUsers.map((ru) => ru.roles.guardName);
        const rolePermissions = user.roleUsers.flatMap((ru) =>
          ru.roles.permissionRoles.map((pr) => pr.permissions.guardName),
        );

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: userRoles,
          permissions: Array.from(new Set(rolePermissions)),
          labId: user.labId,
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
    async jwt({ token, user }) {
      // If `user` object exists, it's the first time this token is being created
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

        // Persist the custom properties from the `authorize` user object to the JWT
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
        token.labId = user.labId;
        token.token = sessionToken;
        token.invalid = false;
        token.exp = Math.floor(expiresAt.getTime() / 1000);
      }

      // On subsequent requests, check if the session is still valid in the DB
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
      }
      return token;
    },

    async session({ session, token }) {
      if (token.invalid) {
        session.user = undefined;
        session.expires = new Date(0).toISOString();
        return session;
      }

      // Pass the custom properties from the JWT to the client-side session object
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.user.labId = token.labId;
      }
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      await prisma.log.create({
        data: {
          type: "AUTH_LOGIN_SUCCESS",
          severity: "INFO",
          message: `User ${user.email} successfully logged in.`,
          userId: user.id,
        },
      });
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);

export const getActionSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Not authenticated");
  }
  return session.user;
};

export const checkPermission = async (
  permissionName: string,
): Promise<boolean> => {
  try {
    const user = await getActionSession();
    return user.permissions.includes(permissionName);
  } catch (error) {
    return false;
  }
};

export const checkAnyPermission = async (
  permissionNames: string[],
): Promise<boolean> => {
  try {
    const user = await getActionSession();
    return permissionNames.some((perm) => user.permissions.includes(perm));
  } catch (error) {
    return false;
  }
};
