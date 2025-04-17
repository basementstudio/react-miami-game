"use client";

import { ControlsQrOverlay } from "@/app/room/[room-id]/controls-qr-overlay";
import { GameCanvas } from "@/app/components/game";
import { useMedia } from "@/hooks/use-media";
import { ControlsMobileOverlay } from "./controls-mobile-overlay";
import { ServerStatusOverlay } from "./server-status-overlay";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { GithubOverlay } from "./github-overlay";

export function Room({ roomId }: { roomId: string }) {
  const isMobile = useIsMobile();
  const bigScreen = useMedia("(min-width: 1024px)", false);

  if (isMobile === undefined) return null;

  const mobileControls = isMobile && !bigScreen;

  return (
    <div className="w-screen h-[100svh]">
      <GameCanvas roomId={roomId} />

      {mobileControls && (
        <div className="absolute top-0 left-0 w-full h-full">
          <ControlsMobileOverlay />
        </div>
      )}
      <ServerStatusOverlay />
      <GithubOverlay />
      {!isMobile && <ControlsQrOverlay />}
    </div>
  );
}
