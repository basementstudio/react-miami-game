"use client";

import {
  controlsInstance,
  useControlsPeerEvent,
} from "@/hooks/use-peer-controls";
import { useState } from "react";
import { OrientationControls } from "../components/utils/orientation-controls";

// Component using the hook
export default function ControlsPage() {
  useControlsPeerEvent("open", () => {
    const idQueryParam = new URLSearchParams(window.location.search).get("id");
    if (idQueryParam) {
      controlsInstance.connectToPeer(idQueryParam);
    }
  });

  const [error, setError] = useState<Error | null>(null);

  useControlsPeerEvent("error", (error) => {
    setError(error);
  });

  if (error) {
    return (
      <div className="flex h-[100svh] items-center justify-center text-center bg-zinc-900 text-white">
        <p className="text-red-500 font-bold text-2xl">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900">
      <OrientationControls
        showInclination
        onAccelerationChange={(acceleration) =>
          controlsInstance.sendMessage("acceleration", acceleration)
        }
        onBreakChange={(brake) => controlsInstance.sendMessage("brake", brake)}
        onSteeringChange={(angle) =>
          controlsInstance.sendMessage("steeringAngle", angle)
        }
        rotationLimit={30}
      />
    </div>
  );
}
