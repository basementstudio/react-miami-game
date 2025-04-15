import { ControlsQrOverlay } from "@/app/components/controls-qr-overlay";
import { GameCanvas } from "@/app/components/game";

export interface RoomPageProps {
  params: Promise<{ "room-id": string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { "room-id": roomId } = await params;

  return (
    <div className="w-screen h-screen">
      <GameCanvas roomId={roomId} />
      <ControlsQrOverlay />
    </div>
  );
}
