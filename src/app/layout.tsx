import React from "react";
import "./globals.css";
import Header from "@/components/footer-header/Header";
import Footer from "@/components/footer-header/Footer";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Toaster } from "@/components/ui/toaster";
import Provider from "../components/Provider";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ua" className="scroll-smooth">
      <body className="flex flex-col min-h-screen">
        <Provider>
          <Header session={session} />
          <main className="flex-grow container mx-auto my-8">{children}</main>
          <Toaster />
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
