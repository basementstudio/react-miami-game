import { MeshDiscardMaterial, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { GLTF } from "three/examples/jsm/Addons.js";

interface TrackGTLF extends GLTF {
  nodes: {
    track: THREE.Mesh;
    collider: THREE.Mesh;
  };
}

export function Track() {
  const track = useGLTF("/game-track.glb") as unknown as TrackGTLF;

  return (
    <>
      <RigidBody type="fixed" colliders="trimesh" restitution={0}>
        <mesh
          geometry={track.nodes.collider.geometry}
          userData={{ isGround: true }}
        >
          <MeshDiscardMaterial />
        </mesh>
      </RigidBody>
      <mesh geometry={track.nodes.track.geometry}>
        <meshStandardMaterial color="#717171" side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}
