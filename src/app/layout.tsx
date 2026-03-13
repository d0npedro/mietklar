import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

const sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MietKlar",
    template: "%s | MietKlar",
  },
  description:
    "MietKlar macht Mietzusammensetzung, offene Margen und Mietaenderungen fuer Mieter und Verwalter nachvollziehbar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${sans.variable} ${display.variable} ${mono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
