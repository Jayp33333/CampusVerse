import { Room, Client } from "@colyseus/core";
import { CampusState, Player } from "./schema/CampusState";

interface MovePayload {
  x: number;
  y: number;
  z: number;
  rotation: number;
}

interface ShovePayload {
  target: string; // sessionId of the player being pushed
  dx: number; // push direction (unit vector)
  dz: number;
}

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

export class CampusRoom extends Room<CampusState> {
  maxClients = 50;

  onCreate(options: any) {
    this.state = new CampusState();

    // Client tells us where it moved; we update its player in the shared state.
    this.onMessage("move", (client, data: MovePayload) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.x = data.x;
      player.y = data.y;
      player.z = data.z;
      player.rotation = data.rotation;
    });

    // Player-vs-player push: relay the impulse to the target's own client,
    // which is authoritative over that avatar's position (knockback).
    this.onMessage("shove", (client, data: ShovePayload) => {
      const target = this.clients.find((c) => c.sessionId === data.target);
      if (target) {
        target.send("shoved", { dx: data.dx, dz: data.dz });
      }
    });

    console.log("CampusRoom created:", this.roomId);
  }

  onJoin(client: Client, options: { name?: string }) {
    const player = new Player();
    player.id = client.sessionId;
    player.name = options?.name || `Student-${client.sessionId.substring(0, 4)}`;
    player.color = COLORS[Math.floor(Math.random() * COLORS.length)];

    // Spawn at a small random offset so players don't overlap.
    player.x = (Math.random() - 0.5) * 6;
    player.y = 0;
    player.z = (Math.random() - 0.5) * 6;

    this.state.players.set(client.sessionId, player);
    console.log(`${player.name} joined (${client.sessionId})`);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    console.log(`${client.sessionId} left`);
  }

  onDispose() {
    console.log("CampusRoom disposed:", this.roomId);
  }
}
