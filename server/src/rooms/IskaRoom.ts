import { Room, Client } from "@colyseus/core";
import { IskaState, Player } from "./schema/IskaState";
import { randomSpawnPosition } from "../world/spawn";

interface MovePayload {
  x: number;
  y: number;
  z: number;
  rotation: number;
  moving?: boolean;
}

interface EmotePayload {
  id: string;
}

interface ShovePayload {
  target: string; // sessionId of the player being pushed
  dx: number; // push direction (unit vector)
  dz: number;
}

interface ChatPayload {
  text: string;
}

interface WhisperPayload {
  target: string;
  text: string;
}

const MAX_CHAT_LENGTH = 200;

function sanitizeChat(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, MAX_CHAT_LENGTH);
}

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

const VALID_EMOTES = new Set([
  "clapping",
  "death",
  "punch",
  "roll",
  "sitting",
  "standing",
  "swordSlash",
]);

const MAX_HEALTH = 100;
const PUNCH_DAMAGE = 25;
const PUNCH_RANGE = 1.6;
const PUNCH_ALIGN_MIN = 0.85;
const RESPAWN_MS = 5000;

export class IskaRoom extends Room<IskaState> {
  maxClients = 50;
  private respawnTimers = new Map<string, ReturnType<typeof setTimeout>>();

  private clearRespawnTimer(sessionId: string) {
    const timer = this.respawnTimers.get(sessionId);
    if (timer) clearTimeout(timer);
    this.respawnTimers.delete(sessionId);
  }

  private killPlayer(sessionId: string) {
    const player = this.state.players.get(sessionId);
    if (!player || player.dead) return;

    player.health = 0;
    player.dead = true;
    player.moving = false;
    player.y = 0;
    player.emote = "death";
    player.emoteSeq += 1;
    player.respawnAt = Date.now() + RESPAWN_MS;

    this.clearRespawnTimer(sessionId);
    const timer = setTimeout(() => this.respawnPlayer(sessionId), RESPAWN_MS);
    this.respawnTimers.set(sessionId, timer);
  }

  private applySpawnPosition(sessionId: string) {
    const player = this.state.players.get(sessionId);
    if (!player) return;

    const others: Player[] = [];
    this.state.players.forEach((p, id) => {
      if (id !== sessionId) others.push(p);
    });

    const { x, z } = randomSpawnPosition(others);
    player.x = x;
    player.y = 0;
    player.z = z;
  }

  private respawnPlayer(sessionId: string) {
    this.clearRespawnTimer(sessionId);
    const player = this.state.players.get(sessionId);
    if (!player) return;

    player.health = MAX_HEALTH;
    player.dead = false;
    player.respawnAt = 0;
    this.applySpawnPosition(sessionId);
    player.emote = "standing";
    player.emoteSeq += 1;
  }

  onCreate(options: any) {
    this.state = new IskaState();

    // Client tells us where it moved; we update its player in the shared state.
    this.onMessage("move", (client, data: MovePayload) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.dead) return;
      player.x = data.x;
      player.y = data.y;
      player.z = data.z;
      player.rotation = data.rotation;
      player.moving = !!data.moving;
    });

    // Player-vs-player push: relay the impulse to the target's own client,
    // which is authoritative over that avatar's position (knockback).
    this.onMessage("shove", (client, data: ShovePayload) => {
      const attacker = this.state.players.get(client.sessionId);
      const targetPlayer = this.state.players.get(data.target);
      const target = this.clients.find((c) => c.sessionId === data.target);
      if (!attacker || !targetPlayer || !target || attacker.dead || targetPlayer.dead) {
        return;
      }

      const ox = targetPlayer.x - attacker.x;
      const oz = targetPlayer.z - attacker.z;
      const dist = Math.hypot(ox, oz);
      if (dist > PUNCH_RANGE || dist < 0.0001) return;

      const toTargetX = ox / dist;
      const toTargetZ = oz / dist;
      const align = toTargetX * data.dx + toTargetZ * data.dz;
      if (align < PUNCH_ALIGN_MIN) return;

      target.send("shoved", { dx: data.dx, dz: data.dz });

      targetPlayer.health = Math.max(0, targetPlayer.health - PUNCH_DAMAGE);
      if (targetPlayer.health <= 0) {
        this.killPlayer(data.target);
      }
    });

    this.onMessage("chat", (client, data: ChatPayload) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const text = sanitizeChat(data.text);
      if (!text) return;

      this.broadcast("chat", {
        fromId: client.sessionId,
        fromName: player.name,
        fromColor: player.color,
        text,
        timestamp: Date.now(),
      });
    });

    this.onMessage("whisper", (client, data: WhisperPayload) => {
      const player = this.state.players.get(client.sessionId);
      const target = this.clients.find((c) => c.sessionId === data.target);
      const targetPlayer = this.state.players.get(data.target);
      if (!player || !target || !targetPlayer || target.sessionId === client.sessionId) return;

      const text = sanitizeChat(data.text);
      if (!text) return;

      const payload = {
        fromId: client.sessionId,
        fromName: player.name,
        fromColor: player.color,
        toId: target.sessionId,
        toName: targetPlayer.name,
        text,
        timestamp: Date.now(),
      };

      client.send("whisper", payload);
      target.send("whisper", payload);
    });

    this.onMessage("emote", (client, data: EmotePayload) => {
      if (!VALID_EMOTES.has(data.id)) return;
      const player = this.state.players.get(client.sessionId);
      if (!player || player.dead) return;
      player.emote = data.id;
      player.emoteSeq += 1;
    });

    console.log("IskaRoom created:", this.roomId);
  }

  onJoin(client: Client, options: { name?: string }) {
    const player = new Player();
    player.id = client.sessionId;
    player.name = options?.name || `Student-${client.sessionId.substring(0, 4)}`;
    player.color = COLORS[Math.floor(Math.random() * COLORS.length)];

    player.health = MAX_HEALTH;
    player.maxHealth = MAX_HEALTH;
    player.dead = false;
    player.respawnAt = 0;

    this.state.players.set(client.sessionId, player);
    this.applySpawnPosition(client.sessionId);

    this.broadcast("presence", {
      event: "joined",
      id: client.sessionId,
      name: player.name,
      color: player.color,
    });
    console.log(`${player.name} joined (${client.sessionId})`);
  }

  onLeave(client: Client) {
    this.clearRespawnTimer(client.sessionId);
    const player = this.state.players.get(client.sessionId);
    if (player) {
      this.broadcast("presence", {
        event: "left",
        id: client.sessionId,
        name: player.name,
      });
    }
    this.state.players.delete(client.sessionId);
    console.log(`${player?.name ?? client.sessionId} left`);
  }

  onDispose() {
    console.log("IskaRoom disposed:", this.roomId);
  }
}
