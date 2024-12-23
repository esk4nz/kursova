import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      userRole: string;
    };
  }

  interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    userRole: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    userRole: string;
  }
}
