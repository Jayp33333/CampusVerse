import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

export interface RespawnSchema {
  dead: boolean;
  respawnAt: number;
}

export function RespawnTimer({ schema }: { schema: RespawnSchema }) {
  const root = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Object3D & { text: string }>(null);

  useFrame(() => {
    if (!root.current) return;

    if (!schema.dead || !schema.respawnAt) {
      root.current.visible = false;
      return;
    }

    const remaining = Math.max(0, schema.respawnAt - Date.now());
    if (remaining <= 0) {
      root.current.visible = false;
      return;
    }

    root.current.visible = true;
    if (textRef.current) {
      textRef.current.text = `${Math.ceil(remaining / 1000)}s`;
    }
  });

  return (
    <Billboard position={[0, 2.15, 0]}>
      <group ref={root} visible={false}>
        <Text
          ref={textRef}
          fontSize={0.24}
          color="#f87171"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="#0f172a"
        >
          5s
        </Text>
      </group>
    </Billboard>
  );
}
