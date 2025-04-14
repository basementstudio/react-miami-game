import { Grid } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export function Ground() {
  return (
    <>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh receiveShadow position={[0, -0.5, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[100, 100]} />
          <meshPhysicalMaterial color="#343434" roughness={0.9} metalness={0} />
        </mesh>
      </RigidBody>
      <Grid
        sectionColor={"#343434"}
        cellColor={"#5a5a5a"}
        position={[0, -0.499, 0]}
        args={[100, 100]}
      />
    </>
  );
}
