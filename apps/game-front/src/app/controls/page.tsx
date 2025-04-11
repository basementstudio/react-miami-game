/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect, useState } from "react"; // Import useState

export default function ControlsPage() {
  const squareRef = useRef<HTMLDivElement>(null);
  const [permissionGranted, setPermissionGranted] = useState(false); // Track permission state
  const [error, setError] = useState<string | null>(null); // Track errors

  // Function to request permission (must be called by user gesture)
  const requestDeviceOrientationPermission = async () => {
    // Check if the specific permission API exists (mainly for iOS)
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const permissionState = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        if (permissionState === "granted") {
          setPermissionGranted(true);
          setError(null); // Clear previous errors
        } else {
          setError("Permission denied.");
          setPermissionGranted(false);
        }
      } catch (err) {
        console.error(err);
        setError(
          `Error requesting permission: ${err instanceof Error ? err.message : String(err)}`
        );
        setPermissionGranted(false);
      }
    } else {
      // For browsers/devices that don't require explicit permission (like Android Chrome over HTTPS)
      // Assume permission is granted if the API exists, or handle it based on event firing
      if (window.DeviceOrientationEvent) {
        setPermissionGranted(true); // Assume granted if API exists and no request function
        setError(null);
      } else {
        setError("Device Orientation API not supported.");
        setPermissionGranted(false);
      }
    }
  };

  useEffect(() => {
    // Only add the listener if permission has been granted
    if (!permissionGranted) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma;
      if (gamma !== null && squareRef.current) {
        const limitedRotation = Math.max(-90, Math.min(90, gamma));
        squareRef.current.style.transform = `rotate(${limitedRotation}deg)`;
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    console.log("Device orientation listener added.");

    // Cleanup function
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      console.log("Device orientation listener removed.");
    };
    // Re-run effect if permissionGranted changes
  }, [permissionGranted]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column", // Stack button and square
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center", // Center text
      }}
    >
      {!permissionGranted && (
        <button
          onClick={requestDeviceOrientationPermission}
          style={{ marginBottom: "20px", padding: "10px 20px" }}
        >
          Enable Controls
        </button>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div
        ref={squareRef}
        style={{
          width: "100px",
          height: "100px",
          backgroundColor: "blue",
          transition: "transform 0.1s ease-out",
          // Ensure initial state is visible even if no events fire immediately
          transform: "rotate(0deg)",
        }}
      ></div>
      {/* Optional: Display status for debugging */}
      {permissionGranted && (
        <p style={{ marginTop: "10px" }}>Controls Enabled</p>
      )}
    </div>
  );
}
