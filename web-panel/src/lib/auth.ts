// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { validate_password } from "./password-utils";
import { randomBytes } from "crypto";
import { getUserAgent } from "./user-agent";

const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours (seconds)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "test@mail.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // 1. Find user
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            role: true,
            email: true,
            password: true,
            name: true,
          },
        });

        if (!user) {
          throw new Error("Invalid University ID or Password!");
        }

        if (!user?.password) {
          throw new Error("Account setup incomplete");
        }

        // 3. Validate password
        const isValid = await validate_password(
          credentials.password,
          user.password,
        );

        if (!isValid) {
          throw new Error("Invalid University ID or Password!");
        }

        // 4. Return user (goes into JWT callback)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
  },

  jwt: {
    maxAge: SESSION_MAX_AGE,
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in only
      if (user) {
        const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
        const sessionToken = randomBytes(32).toString("hex");
        const userAgent = await getUserAgent();

        await prisma.session.create({
          data: {
            sessionToken: sessionToken,
            userId: user.id,
            userAgent: userAgent.userAgent,
            ipAddress: userAgent.ip,
            expiresAt,
          },
        });

        token.token = sessionToken;
        token.exp = Math.floor(expiresAt.getTime() / 1000);
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
        token.invalid = false;

        return token;
      }

      // 🔐 Validate DB session
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

    async session({ session, token }) {
      if (token.invalid) {
        session.user = undefined;
        session.expires = new Date(0).toISOString();
        return session;
      }
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.name = token.name;
        session.expires = new Date(token.exp * 1000).toISOString();
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

