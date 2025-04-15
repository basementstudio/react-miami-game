import { MeshDiscardMaterial, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { GLTF } from "three/examples/jsm/Addons.js";
import { useAssets } from "./assets";

interface TrackGTLF extends GLTF {
  nodes: {
    track: THREE.Mesh;
    collider: THREE.Mesh;
    "ground-collider": THREE.Mesh;
  };
}

export function Track() {
  const { models } = useAssets();
  const result = useGLTF(models.track.url) as unknown as TrackGTLF;

  const [trackScene, _] = useState<THREE.Group | null>(result.scene);
  const [collider, setCollider] = useState<THREE.Mesh | null>(null);

  useEffect(() => {
    const colliderMesh = result.scene.getObjectByName("collider");
    if (colliderMesh) {
      colliderMesh.removeFromParent();
      setCollider(colliderMesh as THREE.Mesh);
    }
  }, [result]);

  if (!trackScene || !collider) return null;

  return (
    <>
      <primitive object={trackScene} />
      <RigidBody type="fixed" colliders="trimesh" restitution={0.3}>
        <primitive object={collider}>
          <MeshDiscardMaterial />
        </primitive>
      </RigidBody>
    </>
  );
}
