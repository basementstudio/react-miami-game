import { GameCanvas } from "./components/game";
import { ControlsQrOverlay } from "./components/controls-qr-overlay";

export default function Home() {
  return (
    <div className="w-screen h-screen">
      <GameCanvas />
      <ControlsQrOverlay />
    </div>
  );
}
