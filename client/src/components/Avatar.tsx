import { Billboard, Text } from "@react-three/drei";

// Simple placeholder mesh for a student. Replace with a GLTF character later.
export function Avatar({ color, name }: { color: string; name: string }) {
  return (
    <group>
      {/* Body */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <capsuleGeometry args={[0.3, 0.6, 4, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Nose / facing indicator (points along +Z, the forward direction) */}
      <mesh position={[0, 0.7, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.25, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Name tag */}
      <Billboard position={[0, 1.6, 0]}>
        <Text fontSize={0.28} color="#e2e8f0" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#0f172a">
          {name}
        </Text>
      </Billboard>
    </group>
  );
}
