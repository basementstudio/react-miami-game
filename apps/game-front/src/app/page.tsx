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
          className="w-full h-full object-cover opacity-40"
          alt=""
        />
      </div>
      <div className="space-y-8 flex flex-col items-center relative p-8">
        <img
          src={models.logo.url}
          className="aspect-video w-full max-w-lg max-h-[40svh]"
          alt="Basement React Miami"
        />
        <Link href="/room/miami">
          <Button>Start 🏁</Button>
        </Link>
      </div>
      <link
        rel="preload"
        crossOrigin="anonymous"
        as="fetch"
        href={models.vehicle.url}
      />
      <link
        rel="preload"
        crossOrigin="anonymous"
        as="fetch"
        href={models.track.url}
      />
      <link
        rel="preload"
        crossOrigin="anonymous"
        as="fetch"
        href={
          "https://raw.githubusercontent.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hdri/venice_sunset_1k.hdr"
        }
      />
    </div>
  );
}
