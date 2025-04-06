import { forwardRef } from "react";
import { type Mesh } from "three";

export const Cube = forwardRef<Mesh>((_, ref) => {
  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial color="green" roughness={0.7} metalness={0.5} />
    </mesh>
  );
});

Cube.displayName = "Cube";
