import { useRef, type MutableRefObject } from "react";
import { Room } from "colyseus.js";
import { Billboard, Text } from "@react-three/drei";
import { CharacterAnimState, CharacterModel } from "./CharacterModel";
import type { EmoteId } from "../character/emotes";
import { HealthBar, type HealthSchema } from "./HealthBar";
import { RespawnTimer } from "./RespawnTimer";

interface Props {
  color: string;
  name: string;
  animState: MutableRefObject<CharacterAnimState>;
  schema: HealthSchema & { respawnAt: number };
}

export function Avatar({ color, name, animState, schema }: Props) {
  return (
    <group>
      <CharacterModel color={color} animState={animState} />

      <HealthBar schema={schema} />
      <RespawnTimer schema={schema} />

      <Billboard position={[0, 1.85, 0]}>
        <Text
          fontSize={0.28}
          color="#e2e8f0"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#0f172a"
        >
          {name}
        </Text>
      </Billboard>
    </group>
  );
}

export function createCharacterAnimState(): CharacterAnimState {
  return {
    isMoving: false,
    isGrounded: true,
    isDead: false,
    emoteSeq: 0,
    emoteId: null,
  };
}

export function useCharacterAnimState(): MutableRefObject<CharacterAnimState> {
  return useRef<CharacterAnimState>(createCharacterAnimState());
}

export function triggerEmote(
  animState: MutableRefObject<CharacterAnimState>,
  id: EmoteId
) {
  animState.current.emoteId = id;
  animState.current.emoteSeq += 1;
}

// Play locally and tell the server so other players see the same emote.
export function playEmote(
  room: Room,
  animState: MutableRefObject<CharacterAnimState>,
  id: EmoteId
) {
  triggerEmote(animState, id);
  room.send("emote", { id });
}

export function playPunch(
  room: Room,
  animState: MutableRefObject<CharacterAnimState>
) {
  triggerEmote(animState, "punch");
  room.send("emote", { id: "punch" });
}
