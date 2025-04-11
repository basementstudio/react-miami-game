"use client";

import { useDeviceOrientation } from "@/hooks/use-device-orientation";
import { useCallback, useEffect, useRef, useState } from "react";

// Component using the hook
export default function ControlsPage() {
  const squareRef = useRef<HTMLDivElement>(null);
  const [orientationType, setOrientationType] =
    useState<OrientationType | null>(null);

  const handleOrientationUpdate = useCallback(
    (event: DeviceOrientationEvent) => {
      let rotationValue: number | null = null;
      const currentOrientation =
        typeof screen !== "undefined"
          ? screen.orientation.type
          : "portrait-primary"; // Default or read
      setOrientationType(currentOrientation); // Update orientation type state

      const isLandscape = currentOrientation.startsWith("landscape");

      if (isLandscape) {
        rotationValue = event.beta; // Use beta for landscape
      } else {
        rotationValue = event.gamma; // Use gamma for portrait
      }

      if (rotationValue !== null && squareRef.current) {
        const limitedRotation = Math.max(-90, Math.min(90, rotationValue));
        squareRef.current.style.transform = `rotate(${limitedRotation}deg)`;
      }
    },
    []
  ); // No dependencies needed here as it reads screen orientation directly

  const {
    requestDeviceOrientation,
    deviceOrientationStarted,
    deviceOrientationError,
  } = useDeviceOrientation({
    onUpdate: handleOrientationUpdate,
    onError: (err) => console.error("Device Orientation Hook Error:", err), // Optional: Handle errors from the hook
    onStarted: () => console.log("Device Orientation Hook Started"), // Optional: Handle start event
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

  if (!deviceOrientationStarted || deviceOrientationError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100svh",
          textAlign: "center",
        }}
      >
        {!deviceOrientationStarted && (
          <button
            onClick={requestDeviceOrientation}
            style={{ marginBottom: "20px", padding: "10px 20px" }}
          >
            Enable Controls
          </button>
        )}
        {deviceOrientationError && (
          <p style={{ color: "red" }}>{deviceOrientationError}</p>
        )}
      </div>
    );
  }

  const okOrientation =
    orientationType && orientationType.startsWith("landscape");

  if (!okOrientation) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100svh",
          textAlign: "center",
        }}
      >
        <p style={{ color: "red" }}>
          Please rotate your device to landscape mode.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100svh",
        textAlign: "center",
      }}
    >
      {!deviceOrientationStarted && (
        <button
          onClick={requestDeviceOrientation}
          style={{ marginBottom: "20px", padding: "10px 20px" }}
        >
          Enable Controls
        </button>
      )}
      {deviceOrientationError && (
        <p style={{ color: "red" }}>{deviceOrientationError}</p>
      )}
      <div
        ref={squareRef}
        style={{
          width: "100px",
          height: "100px",
          backgroundColor: "blue",
          transition: "transform 0.1s ease-out",
          transform: "rotate(0deg)",
        }}
      />
    </div>
  );
}
