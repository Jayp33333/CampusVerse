import { Client, Room, getStateCallbacks } from "colyseus.js";

export { getStateCallbacks };

// Point this at your server. In production use wss:// behind TLS.
const ENDPOINT =
  import.meta.env.VITE_SERVER_URL || "ws://localhost:2567";

export const client = new Client(ENDPOINT);

export interface PlayerState {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
}

export async function joinCampus(name: string): Promise<Room> {
  return client.joinOrCreate("campus", { name });
}
