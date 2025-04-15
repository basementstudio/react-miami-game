"use client";

import { ControlsQrOverlay } from "@/app/room/[room-id]/controls-qr-overlay";
import { GameCanvas } from "@/app/components/game";
import { useMedia } from "@/hooks/use-media";
import { ControlsMobileOverlay } from "./controls-mobile-overlay";

export function Room({ roomId }: { roomId: string }) {
  const isMobile = useMedia("(max-width: 1024px)");

  return (
    <div className="w-screen h-screen">
      <GameCanvas roomId={roomId} />
      {!isMobile && <ControlsQrOverlay />}
      {isMobile && (
        <div className="absolute top-0 left-0 w-full h-full">
          <ControlsMobileOverlay />
        </div>
      )}
    </div>
  );
}
