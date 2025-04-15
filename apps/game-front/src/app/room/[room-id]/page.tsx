import { ControlsQrOverlay } from "@/app/components/controls-qr-overlay";
import { GameCanvas } from "@/app/components/game";

export interface RoomPageProps {
  params: {
    "room-id": string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const roomId = params["room-id"];

  return (
    <div className="w-screen h-screen">
      <GameCanvas roomId={roomId} />
      <ControlsQrOverlay />
    </div>
  );
}
