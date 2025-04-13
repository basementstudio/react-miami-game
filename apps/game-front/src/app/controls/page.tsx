"use client";

import { useDeviceOrientation } from "@/hooks/use-device-orientation";
import {
  controlsInstance,
  useControlsPeerEvent,
} from "@/hooks/use-peer-controls";
import { useCallback, useEffect, useRef, useState } from "react";

// Component using the hook
export default function ControlsPage() {
  useControlsPeerEvent("open", () => {
    const idQueryParam = new URLSearchParams(window.location.search).get("id");
    if (idQueryParam) {
      controlsInstance.connectToPeer(idQueryParam);
    }
  });

  const squareRef = useRef<HTMLDivElement>(null);
  const [orientationType, setOrientationType] =
    useState<OrientationType | null>(null);

  const handleOrientationUpdate = useCallback(
    (event: DeviceOrientationEvent) => {
      const currentOrientation =
        typeof screen !== "undefined"
          ? screen.orientation.type
          : "portrait-primary"; // Default or read
      setOrientationType(currentOrientation); // Update orientation type state

      const rotationValue = event.beta ?? 0; // Use beta for landscape

      controlsInstance.sendMessage("steeringAngle", rotationValue);

      if (squareRef.current) {
        const limitedRotation = Math.max(-90, Math.min(90, rotationValue));
        squareRef.current.style.transform = `rotate(${limitedRotation}deg)`;
      }
    },
    []
  ); // No dependencies needed here as it reads screen orientation directly

  const [error, setError] = useState<Error | null>(null);

  useControlsPeerEvent("error", (error) => {
    setError(error);
  });

  const {
    requestDeviceOrientation,
    deviceOrientationStarted,
    deviceOrientationError,
  } = useDeviceOrientation({
    onUpdate: handleOrientationUpdate,
    onError: (err) => console.error("Device Orientation Hook Error:", err),
  });

  // Effect to update orientation type on change
  useEffect(() => {
    const updateOrientation = () => {
      if (typeof screen !== "undefined") {
        setOrientationType(screen.orientation.type);
      }
    };
    if (typeof screen !== "undefined" && screen.orientation) {
      screen.orientation.addEventListener("change", updateOrientation);
      updateOrientation(); // Initial check
      return () =>
        screen.orientation.removeEventListener("change", updateOrientation);
    }
  }, []);

  if (error) {
    return (
      <div className="flex h-[100svh] items-center justify-center text-center bg-zinc-900 text-white">
        <p className="text-red-500 font-bold text-2xl">{error.message}</p>
      </div>
    );
  }

  if (!deviceOrientationStarted || deviceOrientationError) {
    return (
      <div className="flex h-[100svh] items-center justify-center text-center bg-zinc-900 text-white">
        {!deviceOrientationStarted && (
          <button
            onClick={requestDeviceOrientation}
            style={{ marginBottom: "20px", padding: "10px 20px" }}
          >
            Enable Controls
          </button>
        )}
        {deviceOrientationError && (
          <p className="text-red-500 font-bold text-2xl">
            {deviceOrientationError}
          </p>
        )}
      </div>
    );
  }

  const okOrientation =
    orientationType && orientationType.startsWith("landscape");

  if (!okOrientation) {
    return (
      <div className="flex h-[100svh] items-center justify-center text-center bg-zinc-900 text-white">
        <p className="text-red-500 font-bold text-2xl">
          Please rotate your device to landscape mode.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[100svh] items-center justify-center text-center bg-zinc-900 text-white">
      {!deviceOrientationStarted && (
        <button
          onClick={requestDeviceOrientation}
          style={{ marginBottom: "20px", padding: "10px 20px" }}
        >
          Enable Controls
        </button>
      )}
      <div
        ref={squareRef}
        className="w-24 h-24 bg-blue-500 transition-transform duration-100 ease-out transform rotate-0"
      />
      <div className="absolute top-0 left-0 w-full h-full flex items-stretch justify-stretch"></div>
    </div>
  );
}
