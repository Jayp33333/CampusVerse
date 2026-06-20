export interface Building {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

// Single source of truth: both the renderer (Ground) and the collision
// checker (LocalPlayer) read from this list.
export const BUILDINGS: Building[] = [
  { position: [-12, 2, -10], size: [6, 4, 6], color: "#64748b" },
  { position: [12, 3, -8], size: [5, 6, 8], color: "#52525b" },
];

export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// Footprint (X/Z bounds) of each building for ground collision.
export const OBSTACLES: AABB[] = BUILDINGS.map((b) => ({
  minX: b.position[0] - b.size[0] / 2,
  maxX: b.position[0] + b.size[0] / 2,
  minZ: b.position[2] - b.size[2] / 2,
  maxZ: b.position[2] + b.size[2] / 2,
}));

// Half-size of the world plane (plane is 60x60, so walkable to +/-30).
export const WORLD_HALF = 29;

// Returns true if a player of the given radius at (x, z) overlaps anything.
export function collidesAt(x: number, z: number, radius: number): boolean {
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
