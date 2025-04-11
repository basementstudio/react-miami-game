/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect, useState, useCallback } from "react";

// Define the hook options type
export interface UseDeviceOrientationParams {
  onUpdate: (event: DeviceOrientationEvent) => void;
  onError?: (error: string) => void;
  onStarted?: () => void;
}

// Custom Hook: useDeviceOrientation
export const useDeviceOrientation = ({
  onUpdate,
  onError,
  onStarted,
}: UseDeviceOrientationParams) => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInternalError = useCallback(
    (errorMessage: string) => {
      setError(errorMessage);
      setPermissionGranted(false);
      onError?.(errorMessage); // Call external error handler if provided
    },
    [onError]
  );

  const requestDeviceOrientation = useCallback(async () => {
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
          onStarted?.(); // Call external started handler
        } else {
          handleInternalError("Permission denied.");
        }
      } catch (err) {
        console.error("Error requesting permission:", err);
        handleInternalError(
          `Error requesting permission: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    } else {
      // For browsers/devices that don't require explicit permission
      if (window.DeviceOrientationEvent) {
        // We can't be *sure* it will work without an event, but we can assume
        // it might if the API exists. The effect will add the listener.
        // We'll set permissionGranted optimistically, actual events confirm it.
        setPermissionGranted(true);
        setError(null);
        onStarted?.(); // Assume started if API exists
      } else {
        handleInternalError("Device Orientation API not supported.");
      }
    }
  }, [handleInternalError, onStarted]);

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!permissionGranted) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Check if essential properties exist to ensure it's a valid event
      if (event.alpha === null && event.beta === null && event.gamma === null) {
        console.warn("Received DeviceOrientationEvent with null values.");
        // Optionally handle this case, maybe show a different error or retry permission
        // For now, we just ignore the event.
        return;
      }
      onUpdateRef.current(event);
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [permissionGranted]);

  return {
    requestDeviceOrientation,
    deviceOrientationStarted: permissionGranted,
    deviceOrientationError: error,
  };
};