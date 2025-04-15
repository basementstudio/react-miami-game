import { OrientationControls } from "@/app/components/utils/orientation-controls";
import { controllerVectors } from "@/app/components/vehicle/controller";
import { useEffect } from "react";

export function ControlsMobileOverlay() {
  useEffect(() => {
    controllerVectors.activeJoystick.current = true;

    return () => {
      controllerVectors.activeJoystick.current = false;
    };
  }, []);

  return (
    <OrientationControls
      onAccelerationChange={(acceleration) =>
        (controllerVectors.joystickAcceleration.current = acceleration)
      }
      onBreakChange={(brake) =>
        (controllerVectors.joystickBrake.current = brake)
      }
      onSteeringChange={(angle) =>
        (controllerVectors.joystickRotation.current = angle)
      }
      rotationLimit={30}
    />
  );
}
