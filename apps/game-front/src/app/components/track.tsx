import { MeshDiscardMaterial, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { GLTF } from "three/examples/jsm/Addons.js";

interface TrackGTLF extends GLTF {
  nodes: {
    track: THREE.Mesh;
    collider: THREE.Mesh;
    "ground-collider": THREE.Mesh;
  };
}

export function Track() {
  const track = useGLTF("/game-track.glb") as unknown as TrackGTLF;

  return (
    <>
      <RigidBody type="fixed" colliders="trimesh" restitution={0}>
        <mesh
          userData={{ isGround: true }}
          geometry={track.nodes["ground-collider"].geometry}
        >
          <MeshDiscardMaterial />
        </mesh>
      </RigidBody>
      {/* <RigidBody type="fixed" colliders="trimesh" restitution={0}>
        <mesh
          geometry={track.nodes.collider.geometry}
          userData={{ isGround: true }}
        >
          <MeshDiscardMaterial />
        </mesh>
      </RigidBody> */}
      <mesh geometry={track.nodes.track.geometry}>
        <meshStandardMaterial
          color="#404040"
          side={THREE.DoubleSide}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </>
  );
}
