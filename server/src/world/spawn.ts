// Keep in sync with client/src/world/obstacles.ts
const BUILDINGS = [
  { position: [-12, 2, -10] as const, size: [6, 4, 6] as const },
  { position: [12, 3, -8] as const, size: [5, 6, 8] as const },
];

const OBSTACLES = BUILDINGS.map((b) => ({
  minX: b.position[0] - b.size[0] / 2,
  maxX: b.position[0] + b.size[0] / 2,
  minZ: b.position[2] - b.size[2] / 2,
  maxZ: b.position[2] + b.size[2] / 2,
}));

const WORLD_HALF = 29;
const PLAYER_RADIUS = 0.35;
const SPAWN_EDGE_MARGIN = 2;
const MIN_PLAYER_SPACING = 4;
const MAX_ATTEMPTS = 48;

function collidesAt(x: number, z: number, radius: number): boolean {
  if (Math.abs(x) > WORLD_HALF || Math.abs(z) > WORLD_HALF) return true;
  for (const o of OBSTACLES) {
    if (
      x > o.minX - radius &&
      x < o.maxX + radius &&
      z > o.minZ - radius &&
      z < o.maxZ + radius
    ) {
      return true;
    }
  }
  return false;
}

function nearestPlayerDistance(
  x: number,
  z: number,
  players: Iterable<{ x: number; z: number }>
): number {
  let nearest = Infinity;
  for (const player of players) {
    const dist = Math.hypot(player.x - x, player.z - z);
    if (dist < nearest) nearest = dist;
  }
  return nearest;
}

export function randomSpawnPosition(
  others: Iterable<{ x: number; z: number }> = []
): { x: number; z: number } {
  const range = WORLD_HALF - SPAWN_EDGE_MARGIN;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const x = (Math.random() * 2 - 1) * range;
    const z = (Math.random() * 2 - 1) * range;
    if (collidesAt(x, z, PLAYER_RADIUS)) continue;
    if (nearestPlayerDistance(x, z, others) < MIN_PLAYER_SPACING) continue;
    return { x, z };
  }

  // Last resort: anywhere walkable on the map.
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const x = (Math.random() * 2 - 1) * range;
    const z = (Math.random() * 2 - 1) * range;
    if (!collidesAt(x, z, PLAYER_RADIUS)) return { x, z };
  }

  return { x: 0, z: 0 };
}
