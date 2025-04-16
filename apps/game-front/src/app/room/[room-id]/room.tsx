"use client";

import { ControlsQrOverlay } from "@/app/room/[room-id]/controls-qr-overlay";
import { GameCanvas } from "@/app/components/game";
import { useMedia } from "@/hooks/use-media";
import { ControlsMobileOverlay } from "./controls-mobile-overlay";
import { useEffect, useState } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - IE11
      navigator.msMaxTouchPoints > 0;

    setIsMobile(isTouchDevice);
  }, []);

  return isMobile;
};

export function Room({ roomId }: { roomId: string }) {
  const isMobile = useIsMobile();
  const bigScreen = useMedia("(min-width: 1024px)", false);

  if (isMobile === undefined) return null;

  const mobileControls = isMobile && !bigScreen;

  return (
    <div className="w-screen h-[100svh]">
      <GameCanvas roomId={roomId} />
      {!isMobile && <ControlsQrOverlay />}
      {mobileControls && (
        <div className="absolute top-0 left-0 w-full h-full">
          <ControlsMobileOverlay />
        </div>
      )}
    </div>
  );
}
