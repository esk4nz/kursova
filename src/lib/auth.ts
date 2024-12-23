import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { compare } from "bcrypt";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const existingUser = await db.users.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!existingUser) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          existingUser.pass
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: existingUser.id,
          email: existingUser.email,
          firstName: existingUser.first_name ?? "Невідоме",
          lastName: existingUser.last_name ?? "Невідоме",
          phoneNumber: existingUser.phone_number ?? "Невідомий",
          userRole: existingUser.user_role ?? "User",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user };
      }
      if (user) {
        token.id = user.id as number;
        token.firstName = user.firstName || "Невідоме";
        token.lastName = user.lastName || "Невідоме";
        token.phoneNumber = user.phoneNumber || "Невідомий";
        token.userRole = user.userRole ?? "User";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as number,
          email: token.email ?? "example@example.com",
          firstName: token.firstName ?? "Невідоме",
          lastName: token.lastName ?? "Невідоме",
          phoneNumber: token.phoneNumber ?? "Невідомий",
          userRole: token.userRole ?? "User",
        };
      }
      return session;
    },
  },
};
