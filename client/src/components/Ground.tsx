import { Grid } from "@react-three/drei";
import { BUILDINGS } from "../world/obstacles";

// A simple campus quad + grid so movement is readable. Swap for a real
// campus model (GLTF) later via useGLTF from drei.
export function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      <Grid
        position={[0, 0, 0]}
        args={[60, 60]}
        cellSize={1}
        cellColor="#334155"
        sectionSize={5}
        sectionColor="#475569"
        fadeDistance={60}
        infiniteGrid={false}
      />

      {/* Placeholder "buildings" — these double as collision obstacles. */}
      {BUILDINGS.map((b, i) => (
        <mesh key={i} position={b.position} castShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color={b.color} />
        </mesh>
      ))}
    </group>
  );
}
