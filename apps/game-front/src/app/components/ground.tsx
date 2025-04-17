import { MeshDiscardMaterial } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export function Ground() {
  return (
    <>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh position={[0, 0, 20]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[100, 100]} />
          <MeshDiscardMaterial />
        </mesh>
      </RigidBody>
    </>
  );
}
