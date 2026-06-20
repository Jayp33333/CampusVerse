import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { isEmoteId } from "../character/emotes";
import { Avatar, triggerEmote, useCharacterAnimState } from "./Avatar";

// One remote student. `state` is the live Colyseus schema object, so its
// x/y/z/rotation fields update automatically; we just smoothly follow them.
export function RemotePlayer({ state }: { state: any }) {
  const group = useRef<THREE.Group>(null);
  const animState = useCharacterAnimState();
  const lastEmoteSeq = useRef(state.emoteSeq ?? 0);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const t = 1 - Math.pow(0.001, delta); // frame-rate independent lerp
    g.position.x += (state.x - g.position.x) * t;
    g.position.y += (state.y - g.position.y) * t;
    g.position.z += (state.z - g.position.z) * t;

    // Shortest-path rotation lerp.
    let diff = state.rotation - g.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    g.rotation.y += diff * t;

    // Match local player animation inputs from shared server state.
    animState.current.isMoving = !!state.moving;
    animState.current.isGrounded = state.y <= 0.01;

    if (
      state.emoteSeq !== lastEmoteSeq.current &&
      state.emote &&
      isEmoteId(state.emote)
    ) {
      lastEmoteSeq.current = state.emoteSeq;
      triggerEmote(animState, state.emote);
    }
  });

  return (
    <group ref={group}>
      <Avatar color={state.color} name={state.name} animState={animState} />
    </group>
  );
}
