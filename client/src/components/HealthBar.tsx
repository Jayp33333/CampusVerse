import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";

export interface HealthSchema {
  health: number;
  maxHealth: number;
  dead: boolean;
}

const BAR_WIDTH = 0.9;
const BAR_HEIGHT = 0.1;
const FILL_HEIGHT = 0.08;

export function HealthBar({ schema }: { schema: HealthSchema }) {
  const root = useRef<THREE.Group>(null);
  const fillRef = useRef<THREE.Mesh>(null);
  const fillMat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!root.current || !fillRef.current || !fillMat.current) return;

    if (schema.dead) {
      root.current.visible = false;
      return;
    }

    root.current.visible = true;
    const pct = Math.max(0, Math.min(1, schema.health / schema.maxHealth));
    fillRef.current.scale.x = pct;
    fillRef.current.position.x = (pct - 1) * (BAR_WIDTH * 0.5);
    fillMat.current.color.set(pct > 0.3 ? "#22c55e" : "#ef4444");
  });

  return (
    <Billboard position={[0, 2.15, 0]}>
      <group ref={root}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[BAR_WIDTH, BAR_HEIGHT]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
        </mesh>
        <mesh ref={fillRef} position={[0, 0, 0]}>
          <planeGeometry args={[BAR_WIDTH, FILL_HEIGHT]} />
          <meshBasicMaterial ref={fillMat} color="#22c55e" />
        </mesh>
      </group>
    </Billboard>
  );
}
