import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AssetsProvider } from "./components/assets";
import { client } from "@/lib/basehub";
import { assetsQuery } from "@/lib/basehub";
import { cn } from "@/lib/utils";
import { OverscrollPrevent } from "./components/utils/overscroll-prevent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Basement - React miami",
  description: "Partykit + peerjs demo",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const assetsResult = await client().query(assetsQuery);

  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased overscroll-none select-none"
        )}
        suppressHydrationWarning
      >
        <OverscrollPrevent />
        <AssetsProvider assets={assetsResult}>{children}</AssetsProvider>
      </body>
    </html>
  );
}
