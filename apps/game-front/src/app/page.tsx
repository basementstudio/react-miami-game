/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useAssets } from "./components/assets";
import { Button } from "./components/ui/button";

export default function Home() {
  const { models } = useAssets();

  return (
    <div className="w-screen h-[100svh] flex items-center justify-center bg-[#db2777]">
      <div className="absolute inset-0 w-full h-full">
        <img
          src={models.heroBackground.url}
          className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
          alt=""
        />
      </div>
      <div className="space-y-8 flex flex-col items-center relative p-8">
        <img
          src={models.logo.url}
          className="aspect-video w-full max-w-xl"
          alt="Basement React Miami"
        />
        <Link href="/room/miami">
          <Button>Start 🏁</Button>
        </Link>
      </div>
    </div>
  );
}
