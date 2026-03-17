// lib/auth.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { validate_password } from "./password-utils";

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

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },

  callbacks: {
    // 1. Creates/Updates the JWT (Edge Compatible)
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },

    // 2. Exposes JWT data to the Client/Server Components
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role as any;
        session.user.name = token.name as string;
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

// DO NOT USE the `export const { handlers, auth }` v5 syntax here!
// Just export a default NextAuth handler if needed, or rely on standard route.ts setup.
export default NextAuth(authOptions);
